import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Button-DM0-zK5H.js";import{t as o}from"./Input-CF5u541t.js";import{t as s}from"./Stack-gnRbseNc.js";import{M as c}from"./iframe-DJFLK4ZL.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{t(),r(),c(),o(),a(),s(),l=i`
  <ds-stack gap="normal">
    <ds-input label="Email" name="email" type="email" required></ds-input>
    <ds-input label="Password" name="password" type="password" required></ds-input>
  </ds-stack>
`,u=e=>i`
  <ds-stack slot="actions" direction="horizontal" gap="tight" align="start">
    <ds-button label=${e} type="submit"></ds-button>
  </ds-stack>
`,d=(e,t,r)=>i`
  <ds-form
    name=${n(e.name)}
    label=${n(e.label)}
    labelledBy=${n(e.labelledBy)}
    validate=${n(e.validate)}
    ?disabled=${e.disabled??!1}
    ?no-error-summary=${e.errorSummary===!1}
  >
    ${t} ${r}
  </ds-form>
`,f={title:`Form/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`submit`,`invalid`]}},argTypes:{validate:{control:`select`,options:[`submit`,`blur`,`change`]},disabled:{control:`boolean`},errorSummary:{control:`boolean`}},args:{name:`sign-in`,label:`Sign in`,validate:`submit`,disabled:!1,errorSummary:!0},render:e=>d(e,l,u(`Sign in`))},p={},m={args:{validate:`submit`}},h={args:{validate:`blur`}},g={args:{validate:`change`}},_={args:{disabled:!0}},v={args:{errorSummary:!1}},y={args:{name:`sign-in`,label:`Sign in`},render:e=>d(e,l,u(`Sign in`))},b={args:{name:`profile`,label:`Profile details`,validate:`blur`},render:e=>d(e,i`
        <ds-stack gap="normal">
          <ds-input label="Full name" name="fullName" required></ds-input>
          <ds-input label="Email" name="email" required></ds-input>
          <ds-input label="Phone" name="phone" required></ds-input>
          <ds-input label="City" name="city" required></ds-input>
        </ds-stack>
      `,u(`Save profile`))},x={args:{name:`sign-in`,label:`Sign in`,disabled:!0},render:e=>d(e,l,u(`Sign in`))},S={args:{name:`rename`,label:`Rename file`,errorSummary:!1},render:e=>d(e,i`<ds-input label="File name" name="fileName" required></ds-input>`,u(`Rename`))},C=[`Default`,`ValidateSubmit`,`ValidateBlur`,`ValidateChange`,`Disabled`,`NoErrorSummary`,`SignIn`,`LongFormValidatedOnBlur`,`Submitting`,`WithoutASummary`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'submit'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'blur'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'change'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    errorSummary: false
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in'
  },
  render: args => renderForm(args, signInFields, submitAction('Sign in'))
}`,...y.parameters?.docs?.source},description:{story:`The smallest real form - two fields and one submit action, validated on submit.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'profile',
    label: 'Profile details',
    validate: 'blur'
  },
  render: args => renderForm(args, html\`
        <ds-stack gap="normal">
          <ds-input label="Full name" name="fullName" required></ds-input>
          <ds-input label="Email" name="email" required></ds-input>
          <ds-input label="Phone" name="phone" required></ds-input>
          <ds-input label="City" name="city" required></ds-input>
        </ds-stack>
      \`, submitAction('Save profile'))
}`,...b.parameters?.docs?.source},description:{story:`A longer form where feedback per field as focus leaves it beats one report at the end.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in',
    disabled: true
  },
  render: args => renderForm(args, signInFields, submitAction('Sign in'))
}`,...x.parameters?.docs?.source},description:{story:`A form while its request is in flight - every field and action disabled, so it cannot be submitted twice.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'rename',
    label: 'Rename file',
    errorSummary: false
  },
  render: args => renderForm(args, html\`<ds-input label="File name" name="fileName" required></ds-input>\`, submitAction('Rename'))
}`,...S.parameters?.docs?.source},description:{story:`A short form that reports errors at the fields alone, moving focus to the first invalid one.`,...S.parameters?.docs?.description}}}})))()}w();export{p as Default,_ as Disabled,b as LongFormValidatedOnBlur,v as NoErrorSummary,y as SignIn,x as Submitting,h as ValidateBlur,g as ValidateChange,m as ValidateSubmit,S as WithoutASummary,C as __namedExportsOrder,f as default};