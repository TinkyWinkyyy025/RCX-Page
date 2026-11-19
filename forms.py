"""Shared markup for RCX enquiry and careers forms."""

from html import escape

ACTION = "https://api.web3forms.com/submit"
ACCESS_KEY = "03b0ef70-f50e-48a9-8009-c7212bf0b2dd"
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>'


def field(prefix, name, label, *, kind="text", required=False, autocomplete=None,
          placeholder="", helper="", options=(), wide=False):
    field_id = f"{prefix}-{name}"
    described = f'{field_id}-error' + (f' {field_id}-help' if helper else '')
    attributes = (f'id="{field_id}" name="{name}" aria-describedby="{described}"'
                  + (' required' if required else '')
                  + (f' autocomplete="{autocomplete}"' if autocomplete else ''))
    if kind == "textarea":
        control = f'<textarea {attributes} rows="5" placeholder="{escape(placeholder, quote=True)}"></textarea>'
    elif kind == "select":
        control = f'<select {attributes}><option value="">Select education</option>' + ''.join(
            f'<option value="{escape(option, quote=True)}">{escape(option)}</option>' for option in options
        ) + '</select>'
    else:
        control = f'<input type="{kind}" {attributes} placeholder="{escape(placeholder, quote=True)}">'
    return (f'<div class="rcx-field{" rcx-field--wide" if wide else ""}">'
            f'<label for="{field_id}">{escape(label)}' + (' <span class="rcx-field__required" aria-hidden="true">*</span>' if required else '') + '</label>'
            + control
            + (f'<p class="rcx-field__help" id="{field_id}-help">{escape(helper)}</p>' if helper else '')
            + f'<p class="rcx-field__error" id="{field_id}-error" hidden></p></div>')


def panel(prefix, title, subject, body, button, success):
    return (f'<div class="rcx-form-panel"><div class="rcx-form-panel__header">'
            f'<h3 id="{prefix}-title">{escape(title)}</h3><p id="{prefix}-required">Fields marked * are required.</p></div>'
            f'<form class="rcx-form" action="{ACTION}" method="POST" aria-labelledby="{prefix}-title" '
            f'aria-describedby="{prefix}-required" data-success="{escape(success, quote=True)}">'
            f'<input type="hidden" name="access_key" value="{ACCESS_KEY}">'
            f'<input type="hidden" name="subject" value="{escape(subject, quote=True)}">'
            '<input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" hidden>'
            + body + '<div class="rcx-form__actions">'
            f'<button class="rcx-form__submit" type="submit"><span>{escape(button)}</span>{ARROW}</button>'
            '</div><p class="rcx-form__status" role="status" aria-live="polite" aria-atomic="true" hidden></p>'
            '<p class="rcx-form__recovery" hidden>Need help? <a href="mailto:info@rcxgroup.com">Email our team</a>.</p>'
            '</form></div>')


def contact_form():
    fields = (field("contact", "name", "Full name", required=True, autocomplete="name", placeholder="Your full name")
              + field("contact", "email", "Email address", kind="email", required=True, autocomplete="email", placeholder="you@example.com")
              + field("contact", "contact", "Contact number", kind="tel", autocomplete="tel", placeholder="+60 12 345 6789")
              + field("contact", "enquiry_subject", "Subject", required=True, placeholder="How can we help?")
              + field("contact", "message", "Message", kind="textarea", required=True, wide=True, placeholder="Tell us what you have in mind."))
    return panel("contact", "Send us a message", "RCX Group website enquiry", f'<div class="rcx-form__grid">{fields}</div>',
                 "Send message", "Thank you. Your message has been sent. Our team will be in touch.")


def careers_form():
    details = (field("careers", "first_name", "First name", required=True, autocomplete="given-name", placeholder="First name")
               + field("careers", "last_name", "Last name", required=True, autocomplete="family-name", placeholder="Last name")
               + field("careers", "email", "Email address", kind="email", required=True, autocomplete="email", placeholder="you@example.com")
               + field("careers", "phone", "Contact number", kind="tel", autocomplete="tel", placeholder="+60 12 345 6789")
               + field("careers", "city", "City", autocomplete="address-level2", placeholder="e.g. Kuala Lumpur")
               + field("careers", "country", "Country", autocomplete="country-name", placeholder="e.g. Malaysia"))
    experience = (field("careers", "position", "Position of interest", placeholder="e.g. Marketing Executive")
                  + field("careers", "education", "Highest education", kind="select", options=("SPM", "Diploma", "Degree", "Other"))
                  + field("careers", "linkedin", "LinkedIn profile", kind="url", wide=True, placeholder="https://linkedin.com/in/…")
                  + field("careers", "resume_link", "CV or portfolio link", kind="url", wide=True, placeholder="https://", helper="Share a link that our team can open without requesting access.")
                  + field("careers", "message", "Tell us about yourself", kind="textarea", wide=True, placeholder="Your experience, strengths, and what you would like to do at RCX."))
    body = ('<fieldset class="rcx-form__group"><legend>About you</legend><div class="rcx-form__grid">' + details + '</div></fieldset>'
            '<fieldset class="rcx-form__group"><legend>Your next role</legend><div class="rcx-form__grid">' + experience + '</div></fieldset>')
    form = panel("careers", "Your application", "RCX careers application", body, "Send application",
                 "Thank you. Your application has been sent to the RCX team.")
    return ('<section class="career-apply" id="apply" aria-labelledby="careers-heading"><div class="career-apply-inner">'
            '<div class="rcx-form-intro"><p class="rcx-form-intro__label">Apply now</p>'
            '<h2 id="careers-heading">Let’s grow<br><em>together.</em></h2>'
            '<p>Tell us about yourself and the role you have in mind. Take the next step in your hospitality career with RCX.</p>'
            '<p class="rcx-form-intro__note">Have a CV or portfolio? Include a link so we can get to know your work.</p></div>'
            + form + '</div></section>')
