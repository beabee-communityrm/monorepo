import { CalloutComponentType } from '@beabee/beabee-common';
import type { CalloutComponentInputDateTimeSchema } from '@beabee/beabee-common';

export const calloutDateTime1Form: CalloutComponentInputDateTimeSchema = {
  id: 'eeteu8',
  key: 'whenIsYourBirthday',
  tags: [],
  type: CalloutComponentType.INPUT_DATE_TIME,
  input: true,
  label: 'When is your birthday?',
  logic: [],
  addons: [],
  errors: '',
  format: 'yyyy-MM-dd hh:mm a',
  hidden: false,
  prefix: '',
  suffix: '',
  unique: false,
  widget: {
    mode: 'single',
    type: 'calendar',
    format: 'yyyy-MM-dd hh:mm a',
    locale: 'en',
    maxDate: null,
    minDate: null,
    time_24hr: false,
    allowInput: true,
    enableTime: true,
    noCalendar: false,
    disabledDates: '',
    hourIncrement: 1,
    disableFunction: '',
    disableWeekdays: false,
    disableWeekends: false,
    minuteIncrement: 1,
    displayInTimezone: 'viewer',
    useLocaleSettings: false,
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
  timezone: '',
  validate: {
    json: '',
    custom: '',
    unique: false,
    multiple: false,
    required: false,
    customMessage: '',
    customPrivate: false,
    strictDateValidation: false,
  },
  adminOnly: false,
  autofocus: false,
  encrypted: false,
  hideLabel: false,
  modalEdit: false,
  protected: false,
  refreshOn: '',
  tableView: false,
  allowInput: true,
  attributes: {},
  datePicker: {
    disable: '',
    maxDate: null,
    maxMode: 'year',
    minDate: null,
    minMode: 'day',
    initDate: '',
    yearRows: 4,
    showWeeks: true,
    startingDay: 0,
    yearColumns: 5,
    disableFunction: '',
    disableWeekdays: false,
    disableWeekends: false,
  },
  enableDate: true,
  enableTime: true,
  errorLabel: '',
  persistent: true,
  properties: {},
  timePicker: {
    hourStep: 1,
    arrowkeys: true,
    minuteStep: 1,
    mousewheel: true,
    showMeridian: true,
    readonlyInput: false,
  },
  validateOn: 'change',
  clearOnHide: true,
  conditional: {
    eq: '',
    json: '',
    show: null,
    when: null,
  },
  customClass: '',
  defaultDate: '',
  description: '',
  placeholder: '',
  defaultValue: '',
  customOptions: {},
  dataGridLabel: false,
  labelPosition: 'top',
  showCharCount: false,
  showWordCount: false,
  calculateValue: '',
  datepickerMode: 'day',
  calculateServer: false,
  shortcutButtons: [],
  customConditional: '',
  displayInTimezone: 'viewer',
  useLocaleSettings: false,
  allowMultipleMasks: false,
  customDefaultValue: '',
  enableMaxDateInput: false,
  enableMinDateInput: false,
  allowCalculateOverride: false,
};
