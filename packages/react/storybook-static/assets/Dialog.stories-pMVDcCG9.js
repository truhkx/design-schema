import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-D5pPePpr.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Button-OQwYA6MI.js";import{n as a,t as o}from"./Text-B1hFPUay.js";import{n as s,t as c}from"./Input-D3dYrjhs.js";import{n as l,t as u}from"./Stack-Dye9FNwJ.js";import{n as d,t as f}from"./RadioGroup-47LCbO70.js";import{n as p,t as m}from"./Dialog-DCNxKc4F.js";import{n as h,t as g}from"./Select--B9VQw0y.js";function _({open:e,onClose:t,...n}){let[r,a]=(0,v.useState)(e);return(0,v.useEffect)(()=>a(e),[e]),(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(i,{label:n.heading,onClick:()=>a(!0)}),(0,y.jsx)(m,{...n,open:r,onClose:e=>{t?.(e),a(!1)}})]})}var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{v=t(),p(),r(),s(),d(),h(),l(),a(),y=n(),b=(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(i,{label:`Rename`,variant:`primary`}),(0,y.jsx)(i,{label:`Cancel`,variant:`secondary`})]}),x={title:`Dialog/React`,component:m,args:{open:!0,heading:`Rename project`,children:(0,y.jsx)(c,{label:`Project name`,name:`projectName`,defaultValue:`Q3 roadmap`}),footer:b,hideHeading:!1,size:`md`,dismissible:!0,initialFocus:`first`},argTypes:{size:{control:`inline-radio`,options:[`sm`,`md`,`lg`]},initialFocus:{control:`inline-radio`,options:[`first`,`title`,`close`]},children:{control:!1},footer:{control:!1}},render:e=>(0,y.jsx)(_,{...e}),tags:[`autodocs`]},S={},C={args:{size:`sm`}},w={args:{size:`md`}},T={args:{size:`lg`}},E={args:{initialFocus:`first`}},D={args:{initialFocus:`title`}},O={args:{initialFocus:`close`}},k={args:{hideHeading:!0}},A={args:{description:`Everyone with access will see the new name.`}},j={args:{dismissible:!1}},M={args:{open:!1}},N={args:{open:!0,children:(0,y.jsxs)(u,{gap:`normal`,children:[(0,y.jsx)(c,{label:`Project name`,name:`projectName`,defaultValue:`Q3 roadmap`}),(0,y.jsx)(c,{label:`Slug`,name:`slug`,defaultValue:`q3-roadmap`})]})}},P={args:{open:!0,heading:`Rename project`,children:(0,y.jsx)(c,{label:`Project name`,name:`projectName`,defaultValue:`Q3 roadmap`}),footer:b}},F={args:{open:!0,heading:`Invite people`,children:(0,y.jsxs)(u,{gap:`normal`,children:[(0,y.jsx)(c,{label:`Email`,name:`email`,type:`email`}),(0,y.jsx)(g,{label:`Role`,name:`role`,defaultValue:`member`,options:[{value:`member`,label:`Member`},{value:`admin`,label:`Admin`}]})]}),footer:(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(i,{label:`Send invites`,variant:`primary`}),(0,y.jsx)(i,{label:`Cancel`,variant:`secondary`})]}),size:`sm`}},I={args:{open:!0,heading:`Choose a plan`,description:`You need a plan before you can invite anyone.`,children:(0,y.jsx)(f,{label:`Plan`,name:`plan`,options:[{value:`starter`,label:`Starter`},{value:`team`,label:`Team`},{value:`business`,label:`Business`}]}),footer:(0,y.jsx)(i,{label:`Continue`,variant:`primary`}),dismissible:!1}},L={args:{open:!0,heading:`Terms of service`,children:(0,y.jsxs)(u,{gap:`normal`,children:[(0,y.jsx)(o,{children:`These terms govern your use of the service and any content you create with it.`}),(0,y.jsx)(o,{children:`You keep ownership of your content. You grant us the rights needed to host and display it to the people you share it with.`}),(0,y.jsx)(o,{children:`We may update these terms. When we do, we will tell you before the changes take effect.`}),(0,y.jsx)(o,{children:`You can close your account at any time. Your content is deleted thirty days after closure.`})]}),footer:null,size:`lg`,initialFocus:`title`}},R=[`Default`,`SizeSm`,`SizeMd`,`SizeLg`,`InitialFocusFirst`,`InitialFocusTitle`,`InitialFocusClose`,`HideHeading`,`WithDescription`,`NotDismissible`,`Closed`,`Keyboard`,`RenameProject`,`InvitePeople`,`MustBeAnswered`,`ReadingDialog`],S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'first'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'title'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'close'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Everyone with access will see the new name.'
  }
}`,...A.parameters?.docs?.source},description:{story:`The description is one sentence of consequence under the title, and the accessible description.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    children: <Stack gap="normal">\r
        <Input label="Project name" name="projectName" defaultValue="Q3 roadmap" />\r
        <Input label="Slug" name="slug" defaultValue="q3-roadmap" />\r
      </Stack>
  }
}`,...N.parameters?.docs?.source},description:{story:`Open with its trigger and more than three focusable children, for the keyboard gate.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Rename project',
    children: <Input label="Project name" name="projectName" defaultValue="Q3 roadmap" />,
    footer: renameFooter
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Invite people',
    children: <Stack gap="normal">\r
        <Input label="Email" name="email" type="email" />\r
        <Select label="Role" name="role" defaultValue="member" options={[{
        value: 'member',
        label: 'Member'
      }, {
        value: 'admin',
        label: 'Admin'
      }]} />\r
      </Stack>,
    footer: <>\r
        <Button label="Send invites" variant="primary" />\r
        <Button label="Cancel" variant="secondary" />\r
      </>,
    size: 'sm'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Choose a plan',
    description: 'You need a plan before you can invite anyone.',
    children: <RadioGroup label="Plan" name="plan" options={[{
      value: 'starter',
      label: 'Starter'
    }, {
      value: 'team',
      label: 'Team'
    }, {
      value: 'business',
      label: 'Business'
    }]} />,
    footer: <Button label="Continue" variant="primary" />,
    dismissible: false
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Terms of service',
    children: <Stack gap="normal">\r
        <Text>These terms govern your use of the service and any content you create with it.</Text>\r
        <Text>You keep ownership of your content. You grant us the rights needed to host and display it to the people you share it with.</Text>\r
        <Text>We may update these terms. When we do, we will tell you before the changes take effect.</Text>\r
        <Text>You can close your account at any time. Your content is deleted thirty days after closure.</Text>\r
      </Stack>,
    // No footer: restated as null, since Storybook merges meta.args (the rename footer) into every story.
    footer: null,
    size: 'lg',
    initialFocus: 'title'
  }
}`,...L.parameters?.docs?.source}}}})))()}z();export{M as Closed,S as Default,k as HideHeading,O as InitialFocusClose,E as InitialFocusFirst,D as InitialFocusTitle,F as InvitePeople,N as Keyboard,I as MustBeAnswered,j as NotDismissible,L as ReadingDialog,P as RenameProject,T as SizeLg,w as SizeMd,C as SizeSm,A as WithDescription,R as __namedExportsOrder,x as default};