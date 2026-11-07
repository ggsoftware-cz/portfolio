# Conversion opportunities and competitor research

Research date: 7 November 2026.

The strongest positioning for GG Software's website service is: **Choose the
look. We'll build and launch your website.** It speaks directly to business
owners who want a professional website with little time spent managing it.

This review compares six international competitors' public sales and product
pages with the local portfolio and configurator implementation. It does not
include competitor account onboarding or private conversion data. The proposed
improvements are hypotheses to test, not guaranteed conversion increases.
Implementation observations describe the local build reviewed on this date,
not a verified production deployment. The recommendations below remain proposed
work.

## Competitor comparison

| Competitor | Observed approach | Application to GG Software |
| --- | --- | --- |
| Wix | Emphasises starting free without a credit card, visual examples, and business functionality. [Source](https://www.wix.com/ai-website-builder) | Let visitors experience the result before requesting contact details. The ungated configurator already supports this. |
| Squarespace | Presents strong visual examples, coordinated styles, and direct routes from templates into editing. [Source](https://www.squarespace.com/website-design) | Make choosing a complete visual direction easy, with detailed controls available afterwards. |
| Durable | Leads with a speed promise and examples for recognisable business categories. [Source](https://durable.com/) | Explain how little effort the customer needs to contribute and help them recognise their business immediately. |
| B12 | Combines website generation with access to designers, copywriters, and other experts. [Source](https://www.b12.io/creative-services) | Explain exactly what the team handles after the customer chooses a design. |
| GoDaddy Design Services | Offers different levels of customer involvement, including handing the project over through launch, with customer approval. [Source](https://www.godaddy.com/websites/web-design) | Provide an obvious route to have the team finish the website, including when the visitor makes no customisations. |
| Owner.com | Focuses on restaurant business outcomes, named customer stories, and a personalised website report. [Source](https://www.owner.com/) | Build a restaurant journey around menus, reservations, and orders. Treat its published results as marketing claims, not expected results for GG Software clients. |

These observations support a service built around an easy visual choice and a
clear handover to real people. They do not establish which competitor tactics
cause higher conversion.

## Current strengths

- Four distinct starting points, including a restaurant design.
- Live customisation and responsive previews, including an iPhone-style frame.
- No account or payment required to explore or enquire.
- Saved drafts and shareable design links.
- A short enquiry form with optional notes.
- Existing portfolio pricing and delivery estimates that can be brought closer
  to the configurator's decision points.

## Prioritised improvements

### 1. Complete the enquiry on the website

The implementation supports direct submission. Without a configured production
endpoint, however, it opens the visitor's email application, where the visitor
must send the message themselves. That adds a step after they have already
entered their details.

Enable and verify direct delivery to `info@ggsoftware.cz`, retaining the
email-application handoff as recovery. Confirm success on the page and add a
customer receipt containing the design link and next steps.

Validate delivery to the business inbox before acquiring more traffic. Count
successful submissions separately from submit-button clicks; neither a click
nor opening an email draft proves that an enquiry was received.

### 2. Give website customers a relevant first impression

The current homepage leads with web apps and internal tools. A restaurant owner
looking for a straightforward website may not immediately recognise that the
offer fits them.

Test a dedicated business-website landing page with this proposed message:

> **Your business website, without the weeks of back-and-forth.**
>
> Choose a design, make it yours, and let our team handle the build and launch.
>
> **Explore website designs**

Keep a clear route for custom software enquiries. A dedicated landing page
allows the website service to address its audience while preserving the broader
software offering.

### 3. Show price and scope before customisation

The existing portfolio lists landing pages from **12,900 Kč / €499**, but the
configurator does not display that starting price.

Where the standard offer applies, show its starting price beside the template
and enquiry action. Explain the included scope, optional extras, and any ongoing
charges. Bring the existing delivery estimate into this journey, specifying
what starts the timeline and what can change it.

Do not imply that a starter landing-page price includes a booking engine,
ordering system, or other integration requiring additional work. Price changes
should follow scope, not cosmetic choices, unless the actual commercial offer
states otherwise.

Evaluate this change using qualified enquiries and paid projects. Clear pricing
may reduce unsuitable enquiries while improving the usefulness of those that
remain.

### 4. Offer a quick path through the configurator

The target customer has little time. Make the initial journey equally focused:

**Choose a design → optionally enter a business name and choose a style →
request a quote.**

Offer coordinated presets that change colours, fonts, and spacing together.
Keep detailed controls under a clear "Fine-tune the design" action. Visitors
should be able to submit an unchanged template immediately; customisation must
not become a prerequisite for contacting the team.

This follows progressive disclosure: expose common choices first and reveal
specialised controls on request. The usability rationale comes from
[Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/);
the effect on this site's enquiries still needs testing.

### 5. Place credible evidence beside the enquiry decision

The current site configuration contains team names but no team photos or
completed business identity details. Add real photographs, business details,
and a small number of verifiable client testimonials near the website offer.

Link to relevant projects with the client, their problem, the delivered work,
and any measured outcome that can be substantiated. Clearly identify concept
work when it is not a commissioned client project.

For Savor, a relevant restaurant project would provide more specific reassurance
than a general project counter. Publish only authentic testimonials and
supported results; do not invent ratings or conversion improvements.

### 6. Create a restaurant-specific entry point

Give Savor a sales page explaining the practical possibilities: a readable
mobile menu, opening hours, directions, reservation integration, and optional
ordering. Show what belongs to the starter website and what requires additional
scope, then let visitors open Savor directly.

The current previews are landing-page demonstrations, not functioning
reservation or ordering systems. Keep that distinction clear when describing
the offer.

Apply the same approach later to local services and hospitality, using
business-specific examples, relevant proof, and an appropriate starting design.

### 7. Make the final step concrete and personal

The current enquiry summary includes technical details such as the font and
spacing in pixels. Replace their prominence with a small design preview,
business name, selected design, and included services.

Beside the submit action, explain who will reply, what the customer will
receive, and when to expect it. The portfolio already mentions a 24-hour reply;
repeat that promise here only if the team can consistently meet it. Keep the
short form and optional notes.

## Measurement and experiment plan

Analytics is disabled in the reviewed site configuration. Enable measurement
before running conversion experiments, using the site's existing consent
behaviour and excluding contact details or free-text content from analytics.

Track the journey:

`Visit → select template → open enquiry → successful submission → qualified lead → paid project`

Separate results by device, traffic source, and template. Customisation remains
optional, so editing activity is a diagnostic measure rather than a required
stage. Relate submitted enquiries to qualified leads and paid work through the
team's lead records; page analytics alone cannot establish sales outcomes.

| Priority | Change to evaluate | Primary evidence |
| --- | --- | --- |
| Foundation | Reliable direct submission and event measurement | Confirmed delivery, submission errors, and a trustworthy baseline |
| First experiment | Clear website-service message and visible starting price | Qualified enquiries per visit and subsequent paid projects |
| Second experiment | Quick customisation path with optional advanced controls | Successful enquiries per configurator visitor, with lead quality monitored |
| Third experiment | Restaurant-specific entry page and relevant proof | Qualified restaurant enquiries from comparable traffic sources |

Testing the message and price together evaluates the combined offer; it does
not identify the contribution of each individual change. Split them into
separate experiments if traffic supports that level of measurement.

Do not optimise for time spent adjusting the preview. The intended outcome is
that suitable customers can make a confident choice and become paying clients
with little effort. If traffic is too low for a useful controlled comparison,
start with observed usability sessions and documented customer objections,
without presenting a small before/after change as proof of conversion uplift.
