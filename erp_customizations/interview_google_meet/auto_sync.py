if doc.custom_google_event and doc.custom_meeting_status == "Scheduled":
    before = doc.get_doc_before_save()
    should_sync = False
    if before:
        tracked_fields = ["scheduled_on", "from_time", "to_time", "job_applicant", "designation"]
        for fieldname in tracked_fields:
            if doc.get(fieldname) != before.get(fieldname):
                should_sync = True
        old_interviewers = []
        new_interviewers = []
        for row in before.interview_details:
            old_interviewers.append(row.interviewer)
        for row in doc.interview_details:
            new_interviewers.append(row.interviewer)
        if old_interviewers != new_interviewers:
            should_sync = True

    if should_sync:
        try:
            if not doc.scheduled_on or not doc.from_time or not doc.to_time:
                frappe.throw("Scheduled On, From Time and To Time are required.")
            starts_on = frappe.utils.get_datetime(str(doc.scheduled_on) + " " + str(doc.from_time))
            ends_on = frappe.utils.get_datetime(str(doc.scheduled_on) + " " + str(doc.to_time))
            if ends_on <= starts_on:
                frappe.throw("To Time must be later than From Time.")
            if starts_on <= frappe.utils.now_datetime():
                frappe.throw("The interview meeting must be scheduled in the future.")

            applicant_details = frappe.db.get_value(
                "Job Applicant", doc.job_applicant, ["applicant_name", "email_id"]
            )
            applicant_name = applicant_details[0] or doc.job_applicant
            applicant_email = applicant_details[1]
            if not applicant_email:
                frappe.throw("The Job Applicant does not have an email address.")
            if not doc.interview_details:
                frappe.throw("Add at least one Interviewer before scheduling.")

            event = frappe.get_doc("Event", doc.custom_google_event)
            event.subject = "Interview - " + (doc.designation or "Position") + " - " + applicant_name
            event.description = "BCI interview for " + applicant_name + "\nPosition: " + (doc.designation or "") + "\nERP Interview: " + doc.name
            event.starts_on = starts_on
            event.ends_on = ends_on
            event.event_type = "Private"
            event.status = "Open"
            event.reference_doctype = "Interview"
            event.reference_docname = doc.name
            event.set("event_participants", [])
            event.append("event_participants", {
                "reference_doctype": "Job Applicant",
                "reference_docname": doc.job_applicant,
                "email": applicant_email
            })
            for interviewer_row in doc.interview_details:
                interviewer_email = frappe.db.get_value("User", interviewer_row.interviewer, "email") or interviewer_row.interviewer
                if not interviewer_email:
                    frappe.throw("Every selected Interviewer must have an email address.")
                event.append("event_participants", {
                    "reference_doctype": "User",
                    "reference_docname": interviewer_row.interviewer,
                    "email": interviewer_email
                })

            event.sync_with_google_calendar = 1
            event.add_video_conferencing = 1
            event.save(ignore_permissions=True)
            event.reload()
            frappe.db.set_value("Interview", doc.name, {
                "custom_google_meet_link": event.google_meet_link,
                "custom_meeting_status": "Scheduled",
                "custom_last_sync_error": ""
            }, update_modified=False)
            frappe.msgprint("Google Calendar invitation updated for all attendees.", indicator="green")
        except Exception as error:
            error_text = str(error)[:500]
            frappe.db.set_value("Interview", doc.name, {
                "custom_meeting_status": "Error",
                "custom_last_sync_error": error_text
            }, update_modified=False)
            frappe.log_error(error_text, "Interview automatic meeting synchronization")
            frappe.msgprint("Interview saved, but Google Calendar could not be updated: " + error_text, indicator="red")
