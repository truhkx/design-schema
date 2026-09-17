import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{t}from"./react-DiVRNtpo.js";import{n,t as r}from"./decorators-Dl4455ZU.js";import{l as i}from"./iframe-CAToN8Eb.js";import{n as a,t as o}from"./Button-B0Tk0pjd.js";import{n as s,t as c}from"./Stack-l7fs4Elr.js";import{n as l,t as u}from"./Input-DDaWoxHS.js";import{n as d,t as f}from"./Form-C8YSKIO1.js";var p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{t(),a(),d(),l(),s(),r(),p=i(),m={title:`Form/React Native`,component:f,decorators:[n()],args:{name:`profile`,label:`Profile`,validate:`submit`,disabled:!1,errorSummary:!0},render:e=>(0,p.jsxs)(f,{...e,actions:(0,p.jsxs)(c,{direction:`horizontal`,gap:`normal`,align:`start`,children:[(0,p.jsx)(o,{label:`Save changes`,type:`submit`}),(0,p.jsx)(o,{label:`Cancel`,variant:`secondary`})]}),children:[(0,p.jsx)(u,{label:`Full name`,name:`name`,required:!0}),(0,p.jsx)(u,{label:`Email address`,name:`email`,type:`email`,required:!0,description:`Use the email you signed up with.`})]})},h={},g={args:{validate:`submit`}},_={args:{validate:`blur`}},v={args:{validate:`change`}},y=(0,p.jsxs)(c,{gap:`loose`,children:[(0,p.jsx)(u,{label:`Email`,name:`email`,type:`email`,required:!0}),(0,p.jsx)(u,{label:`Password`,name:`password`,type:`password`,required:!0})]}),b={args:{name:`sign-in`,label:`Sign in`},render:e=>(0,p.jsx)(f,{...e,actions:(0,p.jsx)(o,{label:`Sign in`,type:`submit`}),children:y})},x={args:{name:`profile`,label:`Profile details`,validate:`blur`},render:e=>(0,p.jsx)(f,{...e,actions:(0,p.jsx)(o,{label:`Save profile`,type:`submit`}),children:(0,p.jsxs)(c,{gap:`loose`,children:[(0,p.jsx)(u,{label:`Full name`,name:`fullName`,required:!0}),(0,p.jsx)(u,{label:`Email`,name:`email`,required:!0}),(0,p.jsx)(u,{label:`Phone`,name:`phone`,required:!0}),(0,p.jsx)(u,{label:`City`,name:`city`,required:!0})]})})},S={args:{name:`sign-in`,label:`Sign in`,disabled:!0},render:e=>(0,p.jsx)(f,{...e,actions:(0,p.jsx)(o,{label:`Sign in`,type:`submit`}),children:y})},C={args:{name:`rename`,label:`Rename file`,errorSummary:!1},render:e=>(0,p.jsx)(f,{...e,actions:(0,p.jsx)(o,{label:`Rename`,type:`submit`}),children:(0,p.jsx)(u,{label:`File name`,name:`fileName`,required:!0})})},w=[`Default`,`ValidateSubmit`,`ValidateBlur`,`ValidateChange`,`SignIn`,`LongFormValidatedOnBlur`,`Submitting`,`WithoutASummary`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'submit'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'blur'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    validate: 'change'
  }
}`,...v.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in'
  },
  render: args => <Form {...args} actions={<Button label="Sign in" type="submit" />}>\r
      {signInFields}\r
    </Form>
}`,...b.parameters?.docs?.source},description:{story:`The smallest real form - two fields and one submit action, validated on submit.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'profile',
    label: 'Profile details',
    validate: 'blur'
  },
  render: args => <Form {...args} actions={<Button label="Save profile" type="submit" />}>\r
      <Stack gap="loose">\r
        <Input label="Full name" name="fullName" required />\r
        <Input label="Email" name="email" required />\r
        <Input label="Phone" name="phone" required />\r
        <Input label="City" name="city" required />\r
      </Stack>\r
    </Form>
}`,...x.parameters?.docs?.source},description:{story:`A longer form where feedback per field as focus leaves it beats one report at the end.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in',
    disabled: true
  },
  render: args => <Form {...args} actions={<Button label="Sign in" type="submit" />}>\r
      {signInFields}\r
    </Form>
}`,...S.parameters?.docs?.source},description:{story:`A form while its request is in flight - every field and action disabled, so it cannot be submitted twice.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'rename',
    label: 'Rename file',
    errorSummary: false
  },
  render: args => <Form {...args} actions={<Button label="Rename" type="submit" />}>\r
      <Input label="File name" name="fileName" required />\r
    </Form>
}`,...C.parameters?.docs?.source},description:{story:`A short form that reports errors at the fields alone, moving focus to the first invalid one.`,...C.parameters?.docs?.description}}}})))()}T();export{h as Default,x as LongFormValidatedOnBlur,b as SignIn,S as Submitting,_ as ValidateBlur,v as ValidateChange,g as ValidateSubmit,C as WithoutASummary,w as __namedExportsOrder,m as default};