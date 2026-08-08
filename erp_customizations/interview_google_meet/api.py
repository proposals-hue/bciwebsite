allowed_roles = ["HR User", "HR Manager", "System Manager"]
is_allowed = frappe.session.user == "Administrator"
role_rows = frappe.get_all(
    "Has Role",
    filters={
        "parent": frappe.session.user,
        "parenttype": "User",
        "role": ["in", allowed_roles]
    },
    fields=["role"]
)
if role_rows:
    is_allowed = True
if not is_allowed:
    frappe.throw("You are not permitted to schedule interview meetings.")

interview_name = frappe.form_dict.get("interview")
action = frappe.form_dict.get("action") or "schedule"
if not interview_name:
    frappe.throw("Interview is required.")
if action not in ["schedule", "sync", "cancel"]:
    frappe.throw("Invalid meeting action.")

interview = frappe.get_doc("Interview", interview_name)

if action == "cancel":
    if not interview.custom_google_event:
        frappe.throw("No meeting is linked to this Interview.")
    event = frappe.get_doc("Event", interview.custom_google_event)
    try:
        event.event_type = "Cancelled"
        event.status = "Closed"
        event.save(ignore_permissions=True)
        frappe.db.set_value("Interview", interview.name, {
            "custom_meeting_status": "Cancelled",
            "custom_last_sync_error": ""
        }, update_modified=False)
        frappe.response["message"] = {
            "ok": True,
            "status": "Cancelled",
            "event": event.name,
            "meet_link": event.google_meet_link
        }
    except Exception as error:
        error_text = str(error)[:500]
        frappe.db.set_value("Interview", interview.name, {
            "custom_meeting_status": "Error",
            "custom_last_sync_error": error_text
        }, update_modified=False)
        frappe.log_error(error_text, "Interview meeting cancellation")
        frappe.response["message"] = {"ok": False, "status": "Error", "error": error_text}
else:
    if not interview.job_applicant:
        frappe.throw("Select a Job Applicant before scheduling.")
    if not interview.scheduled_on or not interview.from_time or not interview.to_time:
        frappe.throw("Scheduled On, From Time and To Time are required.")

    starts_on = frappe.utils.get_datetime(str(interview.scheduled_on) + " " + str(interview.from_time))
    ends_on = frappe.utils.get_datetime(str(interview.scheduled_on) + " " + str(interview.to_time))
    if ends_on <= starts_on:
        frappe.throw("To Time must be later than From Time.")
    if starts_on <= frappe.utils.now_datetime():
        frappe.throw("The interview meeting must be scheduled in the future.")

    applicant_details = frappe.db.get_value(
        "Job Applicant", interview.job_applicant, ["applicant_name", "email_id"]
    )
    applicant_name = applicant_details[0] or interview.job_applicant
    applicant_email = applicant_details[1]
    if not applicant_email:
        frappe.throw("The Job Applicant does not have an email address.")
    if not interview.interview_details:
        frappe.throw("Add at least one Interviewer before scheduling.")

    hr_settings = frappe.get_doc("HR Settings", "HR Settings")
    calendar_name = hr_settings.custom_interview_google_calendar
    if not calendar_name:
        frappe.throw("Select Interview Google Calendar in HR Settings.")
    if not frappe.db.get_single_value("Google Settings", "enable"):
        frappe.throw("Google API is not enabled in Google Settings.")

    calendar = frappe.get_doc("Google Calendar", calendar_name)
    if not calendar.enable or not calendar.push_to_google_calendar:
        frappe.throw("The selected Google Calendar must be enabled for push synchronization.")
    if not calendar.google_calendar_id:
        frappe.throw("The selected Google Calendar has not been authorized yet.")

    existing_event = None
    if interview.custom_google_event and frappe.db.exists("Event", interview.custom_google_event):
        existing_event = frappe.get_doc("Event", interview.custom_google_event)

    if action == "schedule" and existing_event and interview.custom_meeting_status == "Scheduled" and existing_event.google_calendar_event_id and existing_event.google_meet_link:
        frappe.response["message"] = {
            "ok": True,
            "status": "Scheduled",
            "event": existing_event.name,
            "meet_link": existing_event.google_meet_link,
            "already_scheduled": True
        }
    else:
        subject = "Interview - " + (interview.designation or "Position") + " - " + applicant_name
        description = "BCI interview for " + applicant_name + "\nPosition: " + (interview.designation or "") + "\nERP Interview: " + interview.name

        if existing_event:
            event = existing_event
        else:
            event = frappe.get_doc({
                "doctype": "Event",
                "subject": subject,
                "starts_on": starts_on,
                "ends_on": ends_on,
                "event_type": "Private",
                "status": "Open",
                "reference_doctype": "Interview",
                "reference_docname": interview.name,
                "sync_with_google_calendar": 0
            })

        event.subject = subject
        event.description = description
        event.starts_on = starts_on
        event.ends_on = ends_on
        event.event_type = "Private"
        event.status = "Open"
        event.reference_doctype = "Interview"
        event.reference_docname = interview.name
        event.google_calendar = calendar.name
        event.google_calendar_id = calendar.google_calendar_id
        event.set("event_participants", [])
        event.append("event_participants", {
            "reference_doctype": "Job Applicant",
            "reference_docname": interview.job_applicant,
            "email": applicant_email
        })
        for interviewer_row in interview.interview_details:
            interviewer_email = frappe.db.get_value("User", interviewer_row.interviewer, "email") or interviewer_row.interviewer
            if not interviewer_email:
                frappe.throw("Every selected Interviewer must have an email address.")
            event.append("event_participants", {
                "reference_doctype": "User",
                "reference_docname": interviewer_row.interviewer,
                "email": interviewer_email
            })

        if event.is_new():
            event.insert(ignore_permissions=True)
            frappe.db.set_value("Interview", interview.name, "custom_google_event", event.name, update_modified=False)

        try:
            event.sync_with_google_calendar = 1
            event.add_video_conferencing = 1
            event.save(ignore_permissions=True)
            event.reload()
            if event.google_meet_link:
                frappe.db.set_value("Interview", interview.name, {
                    "custom_google_event": event.name,
                    "custom_google_meet_link": event.google_meet_link,
                    "custom_meeting_status": "Scheduled",
                    "custom_last_sync_error": ""
                }, update_modified=False)
                frappe.response["message"] = {
                    "ok": True,
                    "status": "Scheduled",
                    "event": event.name,
                    "meet_link": event.google_meet_link
                }
            else:
                error_text = "Google Calendar synchronized but did not return a Google Meet link."
                frappe.db.set_value("Interview", interview.name, {
                    "custom_google_event": event.name,
                    "custom_meeting_status": "Error",
                    "custom_last_sync_error": error_text
                }, update_modified=False)
                frappe.response["message"] = {"ok": False, "status": "Error", "event": event.name, "error": error_text}
        except Exception as error:
            error_text = str(error)[:500]
            frappe.db.set_value("Interview", interview.name, {
                "custom_google_event": event.name,
                "custom_meeting_status": "Error",
                "custom_last_sync_error": error_text
            }, update_modified=False)
            frappe.log_error(error_text, "Interview Google Meet synchronization")
            frappe.response["message"] = {"ok": False, "status": "Error", "event": event.name, "error": error_text}
