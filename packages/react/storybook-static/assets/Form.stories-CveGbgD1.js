import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./Button-OQwYA6MI.js";import{n as i,t as a}from"./Heading-IOamlp7v.js";import{n as o,t as s}from"./Input-D3dYrjhs.js";import{n as c,t as l}from"./Stack-Dye9FNwJ.js";import{n as u,t as d}from"./Form-OOt_tAT6.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{u(),o(),n(),c(),i(),f=t(),p=(0,f.jsxs)(l,{gap:`normal`,children:[(0,f.jsx)(s,{label:`Email`,name:`email`,type:`email`,required:!0}),(0,f.jsx)(s,{label:`Password`,name:`password`,type:`password`,required:!0})]}),m=(0,f.jsx)(r,{label:`Sign in`,type:`submit`}),h={title:`Form/React`,component:d,tags:[`autodocs`],args:{name:`sign-in`,label:`Sign in`,children:p,actions:m},argTypes:{validate:{control:`inline-radio`,options:[`submit`,`blur`,`change`]},onSubmit:{action:`onSubmit`},onInvalid:{action:`onInvalid`}}},g={},_={args:{validate:`submit`}},v={args:{validate:`blur`}},y={args:{validate:`change`}},b={args:{name:`sign-in`,label:`Sign in`,children:(0,f.jsxs)(l,{gap:`normal`,children:[(0,f.jsx)(s,{label:`Email`,name:`email`,type:`email`,required:!0}),(0,f.jsx)(s,{label:`Password`,name:`password`,type:`password`,required:!0}),(0,f.jsx)(s,{label:`Workspace`,name:`workspace`,required:!0})]}),actions:(0,f.jsx)(r,{label:`Sign in`,type:`submit`})}},x={args:{name:`sign-in`,label:`Sign in`,children:p,actions:m}},S={args:{name:`profile`,label:`Profile details`,validate:`blur`,children:(0,f.jsxs)(l,{gap:`normal`,children:[(0,f.jsx)(s,{label:`Full name`,name:`fullName`,required:!0}),(0,f.jsx)(s,{label:`Email`,name:`email`,type:`email`,required:!0}),(0,f.jsx)(s,{label:`Phone`,name:`phone`,type:`tel`,required:!0}),(0,f.jsx)(s,{label:`City`,name:`city`,required:!0})]}),actions:(0,f.jsx)(r,{label:`Save profile`,type:`submit`})}},C={args:{name:`sign-in`,label:`Sign in`,disabled:!0,children:p,actions:m}},w={args:{name:`rename`,label:`Rename file`,errorSummary:!1,children:(0,f.jsx)(s,{label:`File name`,name:`fileName`,required:!0}),actions:(0,f.jsx)(r,{label:`Rename`,type:`submit`})}},T={args:{name:`sign-in`,label:`Sign in`,children:p,actions:m},play:async({canvasElement:e})=>{e.querySelector(`form`)?.requestSubmit(),await new Promise(e=>requestAnimationFrame(()=>e()))}},E={args:{labelledBy:`form-labelled-by-heading`},render:e=>(0,f.jsxs)(l,{gap:`normal`,children:[(0,f.jsx)(a,{id:`form-labelled-by-heading`,level:`2`,children:`Sign in`}),(0,f.jsx)(d,{...e})]})},D=[`Default`,`ValidateSubmit`,`ValidateBlur`,`ValidateChange`,`Keyboard`,`SignIn`,`LongFormValidatedOnBlur`,`Submitting`,`WithoutASummary`,`FailedSubmit`,`LabelledBy`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'submit'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'blur'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'change'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in',
    children: <Stack gap="normal">\r
        <Input label="Email" name="email" type="email" required />\r
        <Input label="Password" name="password" type="password" required />\r
        <Input label="Workspace" name="workspace" required />\r
      </Stack>,
    actions: <Button label="Sign in" type="submit" />
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in',
    children: signInFields,
    actions: signInActions
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'profile',
    label: 'Profile details',
    validate: 'blur',
    children: <Stack gap="normal">\r
        <Input label="Full name" name="fullName" required />\r
        <Input label="Email" name="email" type="email" required />\r
        <Input label="Phone" name="phone" type="tel" required />\r
        <Input label="City" name="city" required />\r
      </Stack>,
    actions: <Button label="Save profile" type="submit" />
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in',
    disabled: true,
    children: signInFields,
    actions: signInActions
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'rename',
    label: 'Rename file',
    errorSummary: false,
    children: <Input label="File name" name="fileName" required />,
    actions: <Button label="Rename" type="submit" />
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in',
    children: signInFields,
    actions: signInActions
  },
  play: async ({
    canvasElement
  }) => {
    canvasElement.querySelector('form')?.requestSubmit();
    // Let React commit the summary before the gates inspect it.
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    labelledBy: 'form-labelled-by-heading'
  },
  render: args => <Stack gap="normal">\r
      <Heading id="form-labelled-by-heading" level="2">\r
        Sign in\r
      </Heading>\r
      <Form {...args} />\r
    </Stack>
}`,...E.parameters?.docs?.source}}}})))()}O();export{g as Default,T as FailedSubmit,b as Keyboard,E as LabelledBy,S as LongFormValidatedOnBlur,x as SignIn,C as Submitting,v as ValidateBlur,y as ValidateChange,_ as ValidateSubmit,w as WithoutASummary,D as __namedExportsOrder,h as default};