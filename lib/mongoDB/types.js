const { Input, Textarea, Date, Checkbox, CheckboxGroup, Select, Editor } = {};
const types = {
  String: {
    Short: { type: String, input: Input },
    Long: { type: String, input: Textarea },
    Id: { type: ObjectId },
    Email: { type: String, email: true },
    Tel: { type: String, tel: true },
    FirstName: { type: String, faker: "firstName" },
    LastName: { type: String, faker: "lastName" },
    Numeric: { type: String, numbersOnly: true }
  },
  Time: {
    Date: { type: "Date" },
    DateTime: "dateTime",
    DatePeriod: "datePeriod",
    Time: "time"
  },
  Editor: {
    Markdown: {
      type: "String",
      input: Editor
    },
    Wysiwyg: {
      type: "String",
      input: Editor
    }
  },
  Enum: {
    Custom: { type: String, enum: [], input: Select },
    Country: "select@countries",
    Gender: "select@gender"
  },
  Number: {
    Int: "number",
    Float: "number@step"
  },
  Json: {},
  Boolean: {},
  Image: {
    url: string,
    size: {
      width: number,
      height: number
    }
  },
  Reference: {
    Model: "enum",
    Id: "enum"
  }
};
