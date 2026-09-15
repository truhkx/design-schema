import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Button-TSn-G4Vm.js";import{t as o}from"./Input-BGhC2i8R.js";import{t as s}from"./Stack-CZSvFm0E.js";import{A as c}from"./iframe-CsoUKhN4.js";var l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{t(),i(),c(),o(),a(),s(),l=n`
  <ds-stack gap="normal">
    <ds-input label="Email address" name="email" type="email" required autocomplete="email"></ds-input>
    <ds-input
      label="Password"
      name="password"
      type="password"
      required
      autocomplete="current-password"
      description="At least 8 characters."
    ></ds-input>
  </ds-stack>
`,u=n`
  <ds-stack slot="actions" direction="horizontal" gap="tight" align="start">
    <ds-button label="Sign in" type="submit"></ds-button>
    <ds-button label="Cancel" variant="secondary"></ds-button>
  </ds-stack>
`,d={title:`Form/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`submit`,`invalid`]}},argTypes:{validate:{control:`select`,options:[`submit`,`blur`,`change`]},disabled:{control:`boolean`},errorSummary:{control:`boolean`}},args:{name:`sign-in`,label:`Sign in`,validate:`submit`,disabled:!1,errorSummary:!0},render:e=>n`
    <ds-form
      name=${e.name}
      label=${r(e.label)}
      validate=${e.validate}
      ?disabled=${e.disabled}
      ?error-summary=${e.errorSummary}
    >
      ${l}
      ${u}
    </ds-form>
  `},f={},p={args:{validate:`submit`}},m={args:{validate:`blur`}},h={args:{validate:`change`}},g={args:{disabled:!0}},_={args:{errorSummary:!1}},v=[`Default`,`ValidateSubmit`,`ValidateBlur`,`ValidateChange`,`Disabled`,`WithoutErrorSummary`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'submit'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'blur'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'change'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    errorSummary: false
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{f as Default,g as Disabled,m as ValidateBlur,h as ValidateChange,p as ValidateSubmit,_ as WithoutErrorSummary,v as __namedExportsOrder,d as default};