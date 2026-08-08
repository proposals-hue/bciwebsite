function bci_interview_meeting_action(frm, action) {
    const run_action = () => {
        frappe.call({
            method: "bci_interview_meeting",
            args: { interview: frm.doc.name, action },
            freeze: true,
            freeze_message: action === "cancel"
                ? __("Cancelling Google Calendar invitation...")
                : __("Synchronizing Google Calendar invitation...")
        }).then((response) => {
            const result = response.message || {};
            if (result.ok) {
                if (result.already_scheduled) {
                    frappe.show_alert({
                        message: __("This Interview already has a Google Meet invitation."),
                        indicator: "blue"
                    });
                } else if (action === "cancel") {
                    frappe.msgprint({
                        title: __("Meeting Cancelled"),
                        message: __("Google Calendar cancellation was sent to all attendees."),
                        indicator: "green"
                    });
                } else {
                    frappe.msgprint({
                        title: __("Google Meet Scheduled"),
                        message: __("The calendar invitation was sent to the applicant and interviewers."),
                        indicator: "green"
                    });
                }
            } else {
                frappe.msgprint({
                    title: __("Google Calendar Sync Error"),
                    message: result.error || __("The invitation could not be synchronized."),
                    indicator: "red"
                });
            }
            frm.reload_doc();
        });
    };

    if (frm.is_dirty()) {
        frm.save().then(run_action);
    } else {
        run_action();
    }
}

function bci_add_interview_meeting_buttons(frm) {
    if (frm.is_new()) return;

    const group = __("Google Meet");
    const status = frm.doc.custom_meeting_status || "Not Scheduled";

    if (!frm.doc.custom_google_event && status !== "Cancelled") {
        frm.add_custom_button(__("Schedule & Send Invite"), () => {
            bci_interview_meeting_action(frm, "schedule");
        }, group);
    }

    if (status === "Scheduled" && frm.doc.custom_google_event) {
        if (frm.doc.custom_google_meet_link) {
            frm.add_custom_button(__("Join Google Meet"), () => {
                window.open(frm.doc.custom_google_meet_link, "_blank", "noopener");
            }, group);
        }
        frm.add_custom_button(__("Sync Invite"), () => {
            bci_interview_meeting_action(frm, "sync");
        }, group);
        frm.add_custom_button(__("Cancel Meeting"), () => {
            frappe.confirm(
                __("Cancel this Google Calendar meeting and notify all attendees?"),
                () => bci_interview_meeting_action(frm, "cancel")
            );
        }, group);
    }

    if (status === "Error") {
        frm.add_custom_button(__("Retry Sync"), () => {
            bci_interview_meeting_action(frm, "sync");
        }, group);
    }

    if (status === "Cancelled") {
        frm.dashboard.set_headline_alert(
            __("This Google Calendar meeting has been cancelled."), "orange"
        );
    } else if (status === "Error" && frm.doc.custom_last_sync_error) {
        frm.dashboard.set_headline_alert(
            __("Google Calendar sync failed: {0}", [frm.doc.custom_last_sync_error]), "red"
        );
    }

    Promise.all([
        frappe.db.get_single_value("Google Settings", "enable"),
        frappe.db.get_single_value("HR Settings", "custom_interview_google_calendar")
    ]).then(([google_enabled, calendar_name]) => {
        if (!google_enabled || !calendar_name) {
            frm.dashboard.set_headline_alert(
                __("Google Meet scheduling requires Google Settings and an Interview Google Calendar in HR Settings."),
                "orange"
            );
        }
    });
}

frappe.ui.form.on("Interview", {
    refresh(frm) {
        bci_add_interview_meeting_buttons(frm);
    }
});
