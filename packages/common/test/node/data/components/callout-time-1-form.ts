import { CalloutComponentType } from '@beabee/beabee-common';
import type { CalloutComponentInputTimeSchema } from '@beabee/beabee-common';

export const calloutTime1Form: CalloutComponentInputTimeSchema = {
  id: 'ezykscw',
  key: 'whatIsTheBestTimeToReachYou',
  mask: false,
  tags: [],
  type: CalloutComponentType.INPUT_TIME,
  input: true,
  label: 'What is the best time to reach you?',
  logic: [],
  addons: [],
  errors: '',
  format: 'HH:mm',
  hidden: false,
  prefix: '',
  suffix: '',
  unique: false,
  widget: {
    type: 'input',
  },
  dbIndex: false,
  overlay: {
    top: '',
    left: '',
    page: '',
    style: '',
    width: '',
    height: '',
  },
  tooltip: '',
  disabled: false,
  multiple: false,
  redrawOn: '',
  tabindex: '',
  validate: {
    json: '',
    custom: '',
    unique: false,
    pattern: '',
    multiple: false,
    required: false,
    maxLength: undefined,
    minLength: undefined,
    customMessage: '',
    customPrivate: false,
    strictDateValidation: false,
  },
  adminOnly: false,
  autofocus: false,
  encrypted: false,
  hideLabel: false,
  inputMask: '99:99',
  inputType: 'time',
  modalEdit: false,
  protected: false,
  refreshOn: '',
  tableView: true,
  attributes: {},
  dataFormat: 'HH:mm:ss',
  errorLabel: '',
  persistent: true,
  properties: {},
  spellcheck: true,
  validateOn: 'change',
  clearOnHide: true,
  conditional: {
    eq: '',
    json: '',
    show: null,
    when: null,
  },
  customClass: '',
  description: '',
  displayMask: '',
  inputFormat: 'plain',
  placeholder: '',
  defaultValue: '',
  dataGridLabel: false,
  labelPosition: 'top',
  showCharCount: false,
  showWordCount: false,
  calculateValue: '',
  calculateServer: false,
  customConditional: '',
  allowMultipleMasks: false,
  customDefaultValue: '',
  allowCalculateOverride: false,
  truncateMultipleSpaces: false,
};
