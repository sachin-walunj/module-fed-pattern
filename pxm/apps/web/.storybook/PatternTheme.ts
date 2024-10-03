import { create } from '@storybook/theming/create'

export default create({
  base: 'light',
  brandTitle: 'Pattern',
  brandImage:
    'https://images.pattern.com/pattern_exp_logos/pxm-isolated-small.svg',
  colorPrimary: '#37a3df', // blue

  // UI
  appBg: '#ffffff', // white
  appContentBg: '#ffffff', // white
  appBorderColor: '#e7eaeb', // light-gray
  appBorderRadius: 4,

  // Typography
  fontBase: '"Wix Madefor Display", sans-serif',

  // Text colors
  textColor: '#1d3261', // dark-purple

  // Toolbar default and active colors
  barTextColor: '#1d3261', // dark-purple
  barSelectedColor: '#1d3261', // dark-purple
  barBg: '#f8f8f8', // lighter-gray

  // Form colors
  inputBg: '#ffffff', // white
  inputBorder: '#b8bcbf', // medium-gray
  inputTextColor: '#1d3261', // dark-purple
  inputBorderRadius: 4,
})
