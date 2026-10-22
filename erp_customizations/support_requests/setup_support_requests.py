"""Prepare ERP for website Customer Care requests (/support).

The website files every support request as a "Feedback and Improvement
Request" (FB-YYYY-#####) through api/_support-request.js. That doctype,
its workflow, SLA table and the Feedback Categories already exist in ERP;
this script adds the pieces the website path needs on top:

1. Custom Fields - a "Website Submission" section holding who asked and how
   to reach them (the doctype has no customer email/phone of its own), plus
   the batch and invoice numbers exactly as the customer typed them.
2. Feedback Assignment Rules - one per Feedback Category the website uses,
   so the doctype's own "Feedback Request Automation" server script fills
   Assigned Department (and Responsible Person, if given) on every request.
   These apply to ALL requests in the category, not only website ones.
3. Notifications -
     * Customer Acknowledgement (enabled): emails the customer their ticket
       reference, in English and Arabic, from the default outgoing account.
       The website only promises "a confirmation has been emailed" while
       this exists and is enabled.
     * Internal Alert (enabled): tells the alert mailbox and the responsible
       person that a website request arrived, with the customer's contacts.
     * Customer Status Update (created DISABLED): emails the customer when
       their request moves to Under Review / In Progress / Resolved / Closed.
       Review the wording in ERP, then enable it.

Idempotent: anything that already exists is reported and left untouched.
Read-only unless --apply is given.

    set ERP_TOKEN=<api key>:<api secret>          (PowerShell: $env:ERP_TOKEN="...")
    python setup_support_requests.py                       # dry run
    python setup_support_requests.py --apply
    python setup_support_requests.py --apply --assignee "Product Quality=qc.lead@bcisaudi.com"

See docs/erp-support-requests.md.
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

DOCTYPE = "Feedback and Improvement Request"

FIELDS = [
    {"fieldname": "custom_website_section", "fieldtype": "Section Break",
     "label": "Website Submission", "insert_after": "related_project"},
    {"fieldname": "custom_source", "fieldtype": "Data", "label": "Source",
     "read_only": 1, "in_standard_filter": 1, "insert_after": "custom_website_section"},
    {"fieldname": "custom_customer_name", "fieldtype": "Data", "label": "Customer Name",
     "insert_after": "custom_source"},
    {"fieldname": "custom_company_name", "fieldtype": "Data", "label": "Company Name",
     "insert_after": "custom_customer_name"},
    {"fieldname": "custom_reported_batch_no", "fieldtype": "Data",
     "label": "Batch / Lot No. (as reported)", "insert_after": "custom_company_name"},
    {"fieldname": "custom_website_column", "fieldtype": "Column Break",
     "insert_after": "custom_reported_batch_no"},
    {"fieldname": "custom_customer_email", "fieldtype": "Data", "options": "Email",
     "label": "Customer Email", "insert_after": "custom_website_column"},
    {"fieldname": "custom_customer_phone", "fieldtype": "Data", "options": "Phone",
     "label": "Customer Phone", "insert_after": "custom_customer_email"},
    {"fieldname": "custom_reported_invoice_po", "fieldtype": "Data",
     "label": "Invoice / PO No. (as reported)", "insert_after": "custom_customer_phone"},
]

# Feedback Category -> Department. Must match TOPICS in api/_support-request.js.
# Note "Technical support  - BCI" really has two spaces in ERP.
ROUTES = {
    "Product Quality": "Quality Management - BCI",
    "Technical Support": "Technical support  - BCI",
    "Delivery / Logistics": "Logistics - BCI",
    "Sales": "Sales - BCI",
    "Finance": "Accounts - BCI",
    "Customer Service": "Customer Service - BCI",
}

# Keep in step with ACK_NOTIFICATION in api/_support-request.js.
ACK_NAME = "Website Support Request - Customer Acknowledgement"
ALERT_NAME = "Website Support Request - Internal Alert"
STATUS_NAME = "Website Support Request - Customer Status Update"

ACK_MESSAGE = """<div dir="ltr">
<p>Dear {{ (doc.custom_customer_name or "Customer") | e }},</p>
<p>Thank you for contacting BCI Customer Care. We have received your request and logged it under the reference below.</p>
<p><strong>Ticket reference:</strong> {{ doc.name }}<br>
<strong>Subject:</strong> {{ doc.subject | e }}</p>
<p>Your request has been passed to the team responsible, who will review it and contact you.
Please quote <strong>{{ doc.name }}</strong> whenever you contact us about this request.</p>
<p>BCI Customer Care<br>Building Chemistry Industry &middot; +966 59 312 0221 &middot; info@bcisaudi.com</p>
</div>
<hr>
<div dir="rtl" style="text-align:right">
<p>عزيزنا {{ (doc.custom_customer_name or "العميل") | e }}،</p>
<p>شكرًا لتواصلك مع خدمة عملاء BCI. استلمنا طلبك وسجّلناه بالرقم المرجعي أدناه.</p>
<p><strong>الرقم المرجعي:</strong> {{ doc.name }}<br>
<strong>الموضوع:</strong> {{ doc.subject | e }}</p>
<p>أُحيل طلبك إلى الفريق المسؤول، وسيقوم بمراجعته والتواصل معك.
يرجى ذكر الرقم <strong>{{ doc.name }}</strong> عند تواصلك معنا بخصوص هذا الطلب.</p>
<p>خدمة عملاء BCI<br>صناعة كيمياء البناء &middot; &lrm;+966 59 312 0221 &middot; info@bcisaudi.com</p>
</div>"""

ALERT_MESSAGE = """<h3>New website support request {{ doc.name }}</h3>
<p><b>Type:</b> {{ doc.request_type }} &middot; {{ doc.feedback_category or "-" }}<br>
<b>Priority:</b> {{ doc.priority }}<br>
<b>Department:</b> {{ doc.assigned_department or "not routed - check the Feedback Assignment Rules" }}<br>
<b>Responsible:</b> {{ doc.assigned_to or "-" }}</p>
<p><b>Customer:</b> {{ (doc.custom_customer_name or "-") | e }}<br>
<b>Company:</b> {{ (doc.custom_company_name or "-") | e }}<br>
<b>Email:</b> {{ (doc.custom_customer_email or "-") | e }}<br>
<b>Phone:</b> {{ (doc.custom_customer_phone or "-") | e }}</p>
<p><b>Subject:</b> {{ doc.subject | e }}</p>
<p>Open {{ doc.name }} in ERP for the full description and attachments.</p>"""

STATUS_MESSAGE = """{% set ar = {"Under Review": "قيد المراجعة", "In Progress": "قيد التنفيذ", "Resolved": "تمت المعالجة", "Closed": "مغلق"} %}
<div dir="ltr">
<p>Dear {{ (doc.custom_customer_name or "Customer") | e }},</p>
<p>Your request <strong>{{ doc.name }}</strong> ({{ doc.subject | e }}) is now <strong>{{ doc.status }}</strong>.</p>
{% if doc.status == "Resolved" and doc.resolution %}<p><strong>Resolution:</strong></p>{{ doc.resolution }}{% endif %}
<p>If you have any questions, reply to this email or call +966 59 312 0221, quoting {{ doc.name }}.</p>
<p>BCI Customer Care</p>
</div>
<hr>
<div dir="rtl" style="text-align:right">
<p>عزيزنا {{ (doc.custom_customer_name or "العميل") | e }}،</p>
<p>حالة طلبك <strong>{{ doc.name }}</strong> ({{ doc.subject | e }}) الآن: <strong>{{ ar.get(doc.status, doc.status) }}</strong>.</p>
<p>لأي استفسار، يمكنك الرد على هذه الرسالة أو الاتصال على &lrm;+966 59 312 0221 مع ذكر الرقم {{ doc.name }}.</p>
<p>خدمة عملاء BCI</p>
</div>"""


def notifications(alert_email):
    website = 'doc.custom_source == "Website"'
    return [
        {
            "name": ACK_NAME, "enabled": 1,
            "event": "New",
            "condition": f"{website} and doc.custom_customer_email",
            "subject": "We have received your request {{ doc.name }} | تم استلام طلبك",
            "recipients": [{"receiver_by_document_field": "custom_customer_email"}],
            "message": ACK_MESSAGE,
        },
        {
            "name": ALERT_NAME, "enabled": 1,
            "event": "New",
            "condition": website,
            "subject": "Website support request {{ doc.name }} - {{ doc.feedback_category }} / {{ doc.priority }}",
            "recipients": [{"receiver_by_document_field": "assigned_to", "cc": alert_email}],
            "message": ALERT_MESSAGE,
        },
        {
            "name": STATUS_NAME, "enabled": 0,
            "event": "Value Change", "value_changed": "status",
            "condition": f'{website} and doc.custom_customer_email and doc.status in ("Under Review", "In Progress", "Resolved", "Closed")',
            "subject": "Update on your request {{ doc.name }}: {{ doc.status }} | تحديث على طلبك",
            "recipients": [{"receiver_by_document_field": "custom_customer_email"}],
            "message": STATUS_MESSAGE,
        },
    ]


class Erp:
    def __init__(self, base, token):
        self.base = base.rstrip("/")
        self.headers = {
            "Authorization": token if token.lower().startswith("token ") else f"token {token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    def call(self, method, path, payload=None, params=None):
        url = self.base + urllib.parse.quote(path)
        if params:
            url += "?" + urllib.parse.urlencode(params)
        data = json.dumps(payload).encode() if payload is not None else None
        for attempt in range(3):
            request = urllib.request.Request(url, data=data, headers=self.headers, method=method)
            try:
                with urllib.request.urlopen(request, timeout=60) as response:
                    return json.load(response)
            except urllib.error.HTTPError:
                raise
            except urllib.error.URLError:
                # This machine's resolver drops lookups now and then.
                if attempt == 2:
                    raise
                time.sleep(2)

    def exists(self, doctype, name):
        try:
            self.call("GET", f"/api/resource/{doctype}/{name}")
            return True
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return False
            raise

    def find(self, doctype, filters, fields=("name",)):
        return self.call("GET", f"/api/resource/{doctype}", params={
            "filters": json.dumps(filters), "fields": json.dumps(list(fields)), "limit_page_length": 200,
        })["data"]


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--apply", action="store_true", help="write to ERP (default: dry run)")
    parser.add_argument("--assignee", action="append", default=[], metavar="CATEGORY=USER",
                        help='responsible person for a category, e.g. "Product Quality=user@bcisaudi.com"')
    parser.add_argument("--alert-email", default="info@bcisaudi.com",
                        help="mailbox copied on every new website request (default: info@bcisaudi.com)")
    args = parser.parse_args()

    token = os.environ.get("ERP_TOKEN", "").strip()
    if not token:
        sys.exit("Set ERP_TOKEN to '<api key>:<api secret>' first.")
    erp = Erp(os.environ.get("ERP_BASE_URL", "https://erp.bcisaudi.net"), token)

    assignees = {}
    for pair in args.assignee:
        category, _, user = pair.partition("=")
        if category.strip() not in ROUTES or not user.strip():
            sys.exit(f"--assignee {pair!r}: use one of {', '.join(ROUTES)} = <ERP user>")
        assignees[category.strip()] = user.strip()

    mode = "APPLY" if args.apply else "DRY RUN (nothing is written; add --apply)"
    print(f"{mode} against {erp.base}\n")

    def write(label, doctype, payload):
        if not args.apply:
            print("  WOULD CREATE", label)
            return
        try:
            erp.call("POST", f"/api/resource/{doctype}", payload)
            print("  CREATED", label)
        except urllib.error.HTTPError as error:
            body = error.read().decode("utf-8", "replace")
            print(f"  FAILED {label}: HTTP {error.code} {body[:400]}")

    print("Custom Fields on", DOCTYPE)
    existing = {row["fieldname"] for row in erp.find("Custom Field", [["dt", "=", DOCTYPE]], ("fieldname",))}
    for field in FIELDS:
        if field["fieldname"] in existing:
            print("  SKIP (exists)", field["fieldname"])
        else:
            write(field["fieldname"], "Custom Field", {"doctype": "Custom Field", "dt": DOCTYPE, **field})

    print("\nFeedback Assignment Rules")
    for category, department in ROUTES.items():
        if not erp.exists("Feedback Category", category):
            print(f"  SKIP {category}: no such Feedback Category")
            continue
        if not erp.exists("Department", department):
            print(f"  SKIP {category}: Department {department!r} not found")
            continue
        user = assignees.get(category)
        if user and not erp.exists("User", user):
            print(f"  SKIP {category}: User {user!r} not found")
            continue
        active = erp.find("Feedback Assignment Rule", [["feedback_category", "=", category], ["active", "=", 1]],
                          ("name", "assigned_department", "assigned_to"))
        if active:
            row = active[0]
            print(f"  SKIP (exists) {category}: {row['name']} -> {row['assigned_department']} / {row['assigned_to'] or '-'}")
            continue
        write(f"{category} -> {department} / {user or 'no responsible person'}", "Feedback Assignment Rule", {
            "doctype": "Feedback Assignment Rule",
            "rule_name": f"Route - {category}",
            "feedback_category": category,
            "assigned_department": department,
            **({"assigned_to": user} if user else {}),
            "active": 1,
        })

    print("\nNotifications")
    for notification in notifications(args.alert_email):
        name = notification["name"]
        if erp.exists("Notification", name):
            print("  SKIP (exists)", name)
            continue
        state = "enabled" if notification["enabled"] else "DISABLED - enable after review"
        write(f"{name} ({state})", "Notification", {
            "doctype": "Notification",
            "document_type": DOCTYPE,
            "channel": "Email",
            "message_type": "HTML",
            "send_system_notification": 0,
            **notification,
        })

    if not args.apply:
        print("\nDry run only. Re-run with --apply to make these changes.")


if __name__ == "__main__":
    main()
