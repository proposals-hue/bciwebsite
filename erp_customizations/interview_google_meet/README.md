# Interview Google Meet customization

Production ERP: `https://erp.bcisaudi.net`

This directory records the ERPNext/Frappe database customizations deployed for
Interview scheduling. The source files mirror the enabled Client Script and
Server Scripts in production.

## Production records

- Client Script: `BCI Interview Google Meet`
- API Server Script: `BCI Interview Google Meet API`
- Draft update hook: `BCI Interview Google Meet Auto Sync`
- Submitted update hook: `BCI Interview Google Meet Submitted Sync`

The two update hooks use the same `auto_sync.py` source, with DocType Event set
to `After Save` and `After Save (Submitted Document)` respectively.

## Custom fields

Interview:

- `custom_google_meet` — Section Break after `to_time`
- `custom_google_event` — read-only Link to Event
- `custom_google_meet_link` — read-only URL
- `custom_meeting_status` — read-only Select
- `custom_last_sync_error` — read-only Small Text

HR Settings:

- `custom_interview_google_calendar` — Link to Google Calendar

## Required administrator setup

1. Enable Google API and enter OAuth credentials in Google Settings.
2. Create and authorize an enabled Google Calendar with push synchronization.
3. Select that calendar in HR Settings > Interview Google Calendar.

Until these steps are complete, the API returns a configuration error without
creating or emailing a Google Calendar invitation.
