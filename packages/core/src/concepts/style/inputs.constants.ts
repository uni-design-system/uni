import type { StyleExpression } from './style.types';

export const removeInputPlatformStyling: StyleExpression = {
  appearance: 'none' /* Removes default platform styling */,
  background: 'none' /* Removes default background */,
  border: 'none' /* Removes default gray border */,
  outline: 'none' /* Removes default focus ring */,
  boxShadow: 'none' /* Removes any inner shadows on iOS */,
  padding: 0 /* Resets default spacing */,
  width: '100%' /* Makes it fill the stylized div */,
};
