import { calloutAddress1Form } from "./callout-address-1-form.ts";
import { calloutCheckbox1Form } from "./callout-checkbox-1-form.ts";
import { calloutContent1Form } from "./callout-content-1-form.ts";
import { calloutDateTime1Form } from "./callout-datetime-1-form.ts";
import { calloutEmail1Form } from "./callout-email-1-form.ts";
import { calloutFile1Form } from "./callout-file-1-form.ts";
import { calloutFile2Form } from "./callout-file-2-form.ts";
import { calloutFile3Form } from "./callout-file-3-form.ts";
import { calloutNumber1Form } from "./callout-number-1-form.ts";
import { calloutNumber2Form } from "./callout-number-2-form.ts";
import { calloutNumber3Form } from "./callout-number-3-form.ts";
import { calloutNumber4Form } from "./callout-number-4-form.ts";
import { calloutPhoneNumber1Form } from "./callout-phone-number-1-form.ts";
import { calloutRadio1Form } from "./callout-radio-1-form.ts";
import { calloutSelect1Form } from "./callout-select-1-form.ts";
import { calloutSelectboxes1Form } from "./callout-selectboxes-1-form.ts";
import { calloutSignature1Form } from "./callout-signature-1-form.ts";
import { calloutTextarea1Form } from "./callout-textarea-1-form.ts";
import { calloutTextarea2Form } from "./callout-textarea-2-form.ts";
import { calloutTime1Form } from "./callout-time-1-form.ts";
import { calloutUrl1Form } from "./callout-url-1-form.ts";

export const calloutFull1Form = {
  slug: "test-callout",
  title:
    "Exploring the Intersection of Software Development and Personal Life - A Comprehensive Survey",
  excerpt:
    "This survey serves as an introduction for a survey designed to explore the relationship between software development and personal life experiences. It invites participants from various backgrounds in the field of software development to share insights on both their professional challenges and personal lives. The survey aims to understand how these two aspects interconnect, contributing to a broader understanding of the software development community. The introduction emphasizes the value of diverse experiences and assures confidentiality, while outlining the structure and estimated time commitment for the survey.",
  image: "http://localhost:3001/uploads/4ar8m0.png?w=1440&h=900",
  allowUpdate: false,
  allowMultiple: false,
  access: "member",
  status: "open",
  hidden: false,
  starts: "2023-12-08T10:39:00.000Z",
  expires: null,
  intro:
    '<p>Dear Participants,</p><p>We are excited to invite you to partake in an insightful survey designed to explore the intricate relationship between the world of software development and personal life experiences. This unique survey aims to delve into not only your professional expertise and challenges in software development but also seeks to understand how these aspects intertwine with your personal life.</p><p>Whether you are a seasoned developer, a newcomer to the field, or somewhere in between, your insights are invaluable. We are interested in a diverse range of experiences - from how you manage work-life balance, to the impact of technology on your daily life, and the personal skills that help you thrive in your career.</p><p>Your participation will contribute significantly to a broader understanding of the software development community and its multifaceted nature. Rest assured, all responses will be treated with the utmost confidentiality and will be used solely for the purpose of this research.</p><p>The survey consists of a blend of multiple-choice and open-ended questions, estimated to take approximately 6 month. We greatly appreciate your time and effort in providing thoughtful responses.</p><p>Thank you for your willingness to share your experiences and insights. Together, let\'s uncover the dynamic relationship between the professional world of software development and the personal spheres of our lives.</p><p></p><p>Kind regards</p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://beabee.io/">beabee</a></p>',
  thanksText:
    "<p>That was very <strong>helpful</strong>, you have just successfully helped to advance the development of Telegram integration.</p>",
  thanksTitle: "Many thanks!",
  formSchema: {
    slides: [
      {
        id: "slidej5rkpu",
        title: "Coding and life",
        components: [calloutTextarea1Form, calloutTextarea2Form],
        navigation: {
          nextText: "Next",
          prevText: "Back",
          submitText: "Submit",
          nextSlideId: "",
        },
      },
      {
        id: "slidecpvs6e",
        title: "Coding",
        components: [calloutRadio1Form, calloutSelectboxes1Form],
        navigation: {
          nextText: "Next",
          prevText: "Back",
          submitText: "Submit",
          nextSlideId: "",
        },
      },
      {
        id: "slide4fmgkk",
        title: "Numbers",
        components: [
          calloutNumber1Form,
          calloutNumber2Form,
          calloutNumber3Form,
          calloutNumber4Form,
        ],
        navigation: {
          nextText: "Next",
          prevText: "Back",
          submitText: "Submit",
          nextSlideId: "",
        },
      },
      {
        id: "slided4f440",
        title: "Contact",
        components: [
          calloutEmail1Form,
          calloutTime1Form,
          calloutAddress1Form,
          calloutUrl1Form,
          calloutPhoneNumber1Form,
          calloutDateTime1Form,
          calloutCheckbox1Form,
          calloutSignature1Form,
        ],
        navigation: {
          nextText: "Next",
          prevText: "Back",
          submitText: "Submit",
          nextSlideId: "",
        },
      },
      {
        id: "slidewxji2g",
        title: "Others",
        components: [
          calloutSelect1Form,
          calloutContent1Form,
          calloutFile1Form,
          calloutFile2Form,
          calloutFile3Form,
        ],
        navigation: {
          nextText: "Next",
          prevText: "Back",
          submitText: "Submit",
          nextSlideId: "",
        },
      },
    ],
  },
};
