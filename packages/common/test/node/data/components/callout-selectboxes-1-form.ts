import { CalloutComponentType } from "@beabee/beabee-common";
import type { CalloutComponentInputSelectableSelectboxesSchema } from "@beabee/beabee-common";

export const calloutSelectboxes1Form: CalloutComponentInputSelectableSelectboxesSchema =
  {
    id: "efumx3e",
    key: "whichProgrammingLanguagesHaveYouAlreadyWorkedWith",
    data: {
      url: ""
    },
    tags: [],
    type: CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES,
    input: true,
    label: "Which programming languages have you already worked with?",
    logic: [],
    addons: [],
    errors: "",
    hidden: false,
    inline: false,
    prefix: "",
    suffix: "",
    unique: false,
    values: [
      {
        label: "JavaScript",
        value: "javaScript",
        nextSlideId: ""
      },
      {
        label: "TypeScript",
        value: "typeScript",
        nextSlideId: ""
      },
      {
        label: "C",
        value: "c",
        nextSlideId: ""
      },
      {
        label: "C++",
        value: "c",
        nextSlideId: ""
      },
      {
        label: "C#",
        value: "c",
        nextSlideId: ""
      },
      {
        label: "Rust",
        value: "rust",
        nextSlideId: ""
      },
      {
        label: "Pascal",
        value: "pascal",
        nextSlideId: ""
      },
      {
        label: "Visual Basic",
        value: "visualBasic",
        nextSlideId: ""
      },
      {
        label: "PHP",
        value: "php",
        nextSlideId: ""
      }
    ],
    widget: null,
    dataSrc: "values",
    dbIndex: false,
    overlay: {
      top: "",
      left: "",
      page: "",
      style: "",
      width: "",
      height: ""
    },
    tooltip: "",
    disabled: false,
    fieldSet: false,
    multiple: false,
    redrawOn: "",
    tabindex: "",
    template: "<span>{{ item.label }}</span>",
    validate: {
      json: "",
      custom: "",
      unique: false,
      multiple: false,
      required: false,
      customMessage: "",
      customPrivate: false,
      onlyAvailableItems: false,
      strictDateValidation: false
    },
    adminOnly: false,
    autofocus: false,
    encrypted: false,
    hideLabel: false,
    inputType: "checkbox",
    modalEdit: false,
    protected: false,
    refreshOn: "",
    tableView: false,
    attributes: {},
    errorLabel: "",
    persistent: true,
    properties: {},
    validateOn: "change",
    clearOnHide: true,
    conditional: {
      eq: "",
      json: "",
      show: null,
      when: null
    },
    customClass: "",
    description: "",
    ignoreCache: false,
    placeholder: "",
    authenticate: false,
    defaultValue: "",
    dataGridLabel: false,
    labelPosition: "top",
    showCharCount: false,
    showWordCount: false,
    valueProperty: "",
    calculateValue: "",
    calculateServer: false,
    customConditional: "",
    allowMultipleMasks: false,
    customDefaultValue: "",
    optionsLabelPosition: "right",
    allowCalculateOverride: false,
    maxSelectedCountMessage: "",
    minSelectedCountMessage: ""
  };