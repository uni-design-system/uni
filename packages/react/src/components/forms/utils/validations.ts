export type ValidationRule =
  | 'email'
  | 'required'
  | 'numeric'
  | 'alphaNumeric'
  | 'alphabetic'
  | 'maxLength'
  | 'minLength';

export const validations: Record<ValidationRule, unknown> = {
  email: {
    rule: () => /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
    formatter(fieldName: string) {
      return `${fieldName} is not valid email`;
    },
  },
  required: {
    rule: () => /\S/,
    formatter(fieldName: string) {
      return `${fieldName} is required.`;
    },
  },
  numeric: {
    rule: () => /^\d+$/,
    formatter(fieldName: string) {
      return `${fieldName} should contain only numbers.`;
    },
  },
  alphaNumeric: {
    rule: () => /^[a-z0-9]+$/i,
    formatter(fieldName: string) {
      return `${fieldName} should not contain special characters, please use only alphabets and numbers.`;
    },
  },
  alphabetic: {
    rule: () => /^[a-z]+$/i,
    formatter(fieldName: string) {
      return `${fieldName} should contain only alphabets.`;
    },
  },
  maxLength: {
    rule: (number: number) => ({
      test: (value: string) => value.length <= number,
    }),
    formatter(fieldName: string, number: number) {
      return number
        ? `${fieldName} can contain maximum ${number} characters.`
        : `${fieldName} contains more characters than expected.`;
    },
  },
  minLength: {
    rule: (number: number) => ({
      test: (value: string) => value.length >= number,
    }),
    formatter(fieldName: string, number: number) {
      return number
        ? `${fieldName} should contain minimum ${number} characters.`
        : `${fieldName} contains less characters than expected.`;
    },
  },
};
