import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./Button-Dwx7L93c.js";import{n as i,t as a}from"./Heading-mMt-zxmQ.js";import{n as o,t as s}from"./Input-CqKLz_2Y.js";import{n as c,t as l}from"./Stack-B9YpxgCt.js";import{n as u,t as d}from"./Form-By_2BE7M.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{u(),o(),n(),c(),i(),f=t(),p=(0,f.jsxs)(l,{gap:`normal`,children:[(0,f.jsx)(s,{label:`Email`,name:`email`,type:`email`,required:!0}),(0,f.jsx)(s,{label:`Password`,name:`password`,type:`password`,required:!0})]}),m=(0,f.jsx)(r,{label:`Sign in`,type:`submit`}),h={title:`Form/React`,component:d,tags:[`autodocs`],args:{name:`sign-in`,label:`Sign in`,children:p,actions:m},argTypes:{validate:{control:`inline-radio`,options:[`submit`,`blur`,`change`]},onSubmit:{action:`onSubmit`},onInvalid:{action:`onInvalid`}}},g={},_={args:{validate:`submit`}},v={args:{validate:`blur`}},y={args:{validate:`change`}},b={args:{name:`sign-in`,label:`Sign in`,children:p,actions:m}},x={args:{name:`profile`,label:`Profile details`,validate:`blur`,children:(0,f.jsxs)(l,{gap:`normal`,children:[(0,f.jsx)(s,{label:`Full name`,name:`fullName`,required:!0}),(0,f.jsx)(s,{label:`Email`,name:`email`,type:`email`,required:!0}),(0,f.jsx)(s,{label:`Phone`,name:`phone`,type:`tel`,required:!0}),(0,f.jsx)(s,{label:`City`,name:`city`,required:!0})]}),actions:(0,f.jsx)(r,{label:`Save profile`,type:`submit`})}},S={args:{name:`sign-in`,label:`Sign in`,disabled:!0,children:p,actions:m}},C={args:{name:`rename`,label:`Rename file`,errorSummary:!1,children:(0,f.jsx)(s,{label:`File name`,name:`fileName`,required:!0}),actions:(0,f.jsx)(r,{label:`Rename`,type:`submit`})}},w={args:{name:`sign-in`,label:`Sign in`,children:p,actions:m},play:async({canvasElement:e})=>{e.querySelector(`form`)?.requestSubmit(),await new Promise(e=>requestAnimationFrame(()=>e()))}},T={args:{labelledBy:`form-labelled-by-heading`},render:e=>(0,f.jsxs)(l,{gap:`normal`,children:[(0,f.jsx)(a,{id:`form-labelled-by-heading`,level:`2`,children:`Sign in`}),(0,f.jsx)(d,{...e})]})},E=[`Default`,`ValidateSubmit`,`ValidateBlur`,`ValidateChange`,`SignIn`,`LongFormValidatedOnBlur`,`Submitting`,`WithoutASummary`,`FailedSubmit`,`LabelledBy`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
    children: signInFields,
    actions: signInActions
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'sign-in',
    label: 'Sign in',
    disabled: true,
    children: signInFields,
    actions: signInActions
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'rename',
    label: 'Rename file',
    errorSummary: false,
    children: <Input label="File name" name="fileName" required />,
    actions: <Button label="Rename" type="submit" />
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    labelledBy: 'form-labelled-by-heading'
  },
  render: args => <Stack gap="normal">\r
      <Heading id="form-labelled-by-heading" level="2">\r
        Sign in\r
      </Heading>\r
      <Form {...args} />\r
    </Stack>
}`,...T.parameters?.docs?.source}}}})))()}D();export{g as Default,w as FailedSubmit,T as LabelledBy,x as LongFormValidatedOnBlur,b as SignIn,S as Submitting,v as ValidateBlur,y as ValidateChange,_ as ValidateSubmit,C as WithoutASummary,E as __namedExportsOrder,h as default};