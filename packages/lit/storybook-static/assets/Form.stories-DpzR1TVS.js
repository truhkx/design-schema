import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Button-B3rVveNU.js";import{t as o}from"./Heading-9iQ-E2rO.js";import{t as s}from"./Input-C44YOz46.js";import{t as c}from"./Stack-CZci_zJ9.js";import{M as l}from"./iframe-C6sywzE2.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{t(),r(),l(),s(),a(),c(),o(),u=i`
  <ds-stack gap="normal">
    <ds-input label="Email" name="email" type="email" required></ds-input>
    <ds-input label="Password" name="password" type="password" required></ds-input>
  </ds-stack>
`,d={title:`Form/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`submit`,`invalid`]}},argTypes:{validate:{control:`inline-radio`,options:[`submit`,`blur`,`change`]},disabled:{control:`boolean`},errorSummary:{control:`boolean`}},args:{name:`sign-in`,label:`Sign in`},render:e=>i`
    <ds-form
      name=${n(e.name)}
      label=${n(e.label)}
      labelled-by=${n(e.labelledBy)}
      validate=${n(e.validate)}
      ?disabled=${e.disabled??!1}
      ?no-error-summary=${e.errorSummary===!1}
    >
      ${u}
      <ds-button slot="actions" label="Sign in" type="submit"></ds-button>
    </ds-form>
  `},f={},p={args:{validate:`submit`}},m={args:{validate:`blur`}},h={args:{validate:`change`}},g={args:{name:`sign-in`,label:`Sign in`},render:e=>i`
    <ds-form
      name=${n(e.name)}
      label=${n(e.label)}
      validate=${n(e.validate)}
      ?disabled=${e.disabled??!1}
      ?no-error-summary=${e.errorSummary===!1}
    >
      <ds-stack gap="normal">
        <ds-input label="Email" name="email" type="email" required></ds-input>
        <ds-input label="Password" name="password" type="password" required></ds-input>
        <ds-input label="Workspace" name="workspace" required></ds-input>
      </ds-stack>
      <ds-button slot="actions" label="Sign in" type="submit"></ds-button>
    </ds-form>
  `},_={args:{name:`sign-in`,label:`Sign in`}},v={args:{name:`profile`,label:`Profile details`,validate:`blur`},render:e=>i`
    <ds-form
      name=${n(e.name)}
      label=${n(e.label)}
      validate=${n(e.validate)}
      ?disabled=${e.disabled??!1}
      ?no-error-summary=${e.errorSummary===!1}
    >
      <ds-stack gap="normal">
        <ds-input label="Full name" name="fullName" required></ds-input>
        <ds-input label="Email" name="email" type="email" required></ds-input>
        <ds-input label="Phone" name="phone" type="tel" required></ds-input>
        <ds-input label="City" name="city" required></ds-input>
      </ds-stack>
      <ds-button slot="actions" label="Save profile" type="submit"></ds-button>
    </ds-form>
  `},y={args:{name:`sign-in`,label:`Sign in`,disabled:!0}},b={args:{name:`rename`,label:`Rename file`,errorSummary:!1},render:e=>i`
    <ds-form
      name=${n(e.name)}
      label=${n(e.label)}
      validate=${n(e.validate)}
      ?disabled=${e.disabled??!1}
      ?no-error-summary=${e.errorSummary===!1}
    >
      <ds-input label="File name" name="fileName" required></ds-input>
      <ds-button slot="actions" label="Rename" type="submit"></ds-button>
    </ds-form>
  `},x={args:{name:`sign-in`,label:`Sign in`},play:async({canvasElement:e})=>{let t=e.querySelector(`ds-form`);t!==null&&(await t.updateComplete,t.submit(),await t.updateComplete)}},S={args:{labelledBy:`form-labelled-by-heading`},render:e=>i`
    <ds-stack gap="normal">
      <ds-heading id="form-labelled-by-heading" level="2">Sign in</ds-heading>
      <ds-form
        name=${n(e.name)}
        label=${n(e.label)}
        labelled-by=${n(e.labelledBy)}
        validate=${n(e.validate)}
        ?disabled=${e.disabled??!1}
        ?no-error-summary=${e.errorSummary===!1}
      >
        ${u}
        <ds-button slot="actions" label="Sign in" type="submit"></ds-button>
      </ds-form>
    </ds-stack>
  `},C=[`Default`,`ValidateSubmit`,`ValidateBlur`,`ValidateChange`,`Keyboard`,`SignIn`,`LongFormValidatedOnBlur`,`Submitting`,`WithoutASummary`,`FailedSubmit`,`LabelledBy`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
    name: 'sign-in',
    label: 'Sign in'
  },
  render: args => html\`
    <ds-form
      name=\${ifDefined(args.name)}
      label=\${ifDefined(args.label)}
      validate=\${ifDefined(args.validate)}
      ?disabled=\${args.disabled ?? false}
      ?no-error-summary=\${args.errorSummary === false}
    >
      <ds-stack gap="normal">
        <ds-input label="Email" name="email" type="email" required></ds-input>
        <ds-input label="Password" name="password" type="password" required></ds-input>
        <ds-input label="Workspace" name="workspace" required></ds-input>
      </ds-stack>
      <ds-button slot="actions" label="Sign in" type="submit"></ds-button>
    </ds-form>
  \`
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in'
  }
}`,..._.parameters?.docs?.source},description:{story:`The smallest real form - two fields and one submit action, validated on submit.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'profile',
    label: 'Profile details',
    validate: 'blur'
  },
  render: args => html\`
    <ds-form
      name=\${ifDefined(args.name)}
      label=\${ifDefined(args.label)}
      validate=\${ifDefined(args.validate)}
      ?disabled=\${args.disabled ?? false}
      ?no-error-summary=\${args.errorSummary === false}
    >
      <ds-stack gap="normal">
        <ds-input label="Full name" name="fullName" required></ds-input>
        <ds-input label="Email" name="email" type="email" required></ds-input>
        <ds-input label="Phone" name="phone" type="tel" required></ds-input>
        <ds-input label="City" name="city" required></ds-input>
      </ds-stack>
      <ds-button slot="actions" label="Save profile" type="submit"></ds-button>
    </ds-form>
  \`
}`,...v.parameters?.docs?.source},description:{story:`A longer form where feedback per field as focus leaves it beats one report at the end.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in',
    disabled: true
  }
}`,...y.parameters?.docs?.source},description:{story:`A form while its request is in flight - every field and action disabled, so it cannot be submitted twice.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'rename',
    label: 'Rename file',
    errorSummary: false
  },
  render: args => html\`
    <ds-form
      name=\${ifDefined(args.name)}
      label=\${ifDefined(args.label)}
      validate=\${ifDefined(args.validate)}
      ?disabled=\${args.disabled ?? false}
      ?no-error-summary=\${args.errorSummary === false}
    >
      <ds-input label="File name" name="fileName" required></ds-input>
      <ds-button slot="actions" label="Rename" type="submit"></ds-button>
    </ds-form>
  \`
}`,...b.parameters?.docs?.source},description:{story:`A short form that reports errors at the fields alone, moving focus to the first invalid one.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in'
  },
  play: async ({
    canvasElement
  }) => {
    const form = canvasElement.querySelector<DsForm>('ds-form');
    if (form === null) return;
    await form.updateComplete;
    form.submit();
    await form.updateComplete;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    labelledBy: 'form-labelled-by-heading'
  },
  render: args => html\`
    <ds-stack gap="normal">
      <ds-heading id="form-labelled-by-heading" level="2">Sign in</ds-heading>
      <ds-form
        name=\${ifDefined(args.name)}
        label=\${ifDefined(args.label)}
        labelled-by=\${ifDefined(args.labelledBy)}
        validate=\${ifDefined(args.validate)}
        ?disabled=\${args.disabled ?? false}
        ?no-error-summary=\${args.errorSummary === false}
      >
        \${signInFields}
        <ds-button slot="actions" label="Sign in" type="submit"></ds-button>
      </ds-form>
    </ds-stack>
  \`
}`,...S.parameters?.docs?.source}}}})))()}w();export{f as Default,x as FailedSubmit,g as Keyboard,S as LabelledBy,v as LongFormValidatedOnBlur,_ as SignIn,y as Submitting,m as ValidateBlur,h as ValidateChange,p as ValidateSubmit,b as WithoutASummary,C as __namedExportsOrder,d as default};