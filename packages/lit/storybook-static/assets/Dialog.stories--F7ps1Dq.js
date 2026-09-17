import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Text-C3do0IPT.js";import{t as o}from"./Button-DM0-zK5H.js";import{t as s}from"./Input-CF5u541t.js";import{t as c}from"./Stack-gnRbseNc.js";import{t as l}from"./Dialog-C_sNSIkq.js";import{t as u}from"./Select-CKPhcmgN.js";import{A as d}from"./iframe-DJFLK4ZL.js";function f(e){let t=e.currentTarget.closest(`ds-dialog`);t&&(t.open=!1)}function p(e){let t=e.currentTarget.nextElementSibling;t&&(t.open=!0)}function m(e,t,r){return i`
    <ds-button label="Open dialog" @press=${p}></ds-button>
    <ds-dialog
      ?open=${e.open}
      heading=${e.heading}
      description=${n(e.description)}
      ?hide-heading=${e.hideHeading??!1}
      size=${e.size??`md`}
      ?no-dismiss=${e.dismissible===!1}
      initial-focus=${e.initialFocus??`first`}
      @close=${f}
    >
      ${t} ${r??``}
    </ds-dialog>
  `}var h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{t(),r(),l(),o(),s(),a(),d(),u(),c(),h=i`<ds-input label="Project name" name="projectName" value="Untitled project"></ds-input>`,g=i`
  <ds-button slot="footer" variant="primary" label="Rename" @press=${f}></ds-button>
  <ds-button slot="footer" variant="secondary" label="Cancel" @press=${f}></ds-button>
`,_={title:`Dialog/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`close`,`opened`]}},argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`]},initialFocus:{control:`select`,options:[`first`,`title`,`close`]}},args:{open:!0,heading:`Rename project`,hideHeading:!1,size:`md`,dismissible:!0,initialFocus:`first`},render:e=>m(e,h,g)},v={},y={args:{size:`sm`}},b={args:{size:`md`}},x={args:{size:`lg`}},S={args:{initialFocus:`first`}},C={args:{initialFocus:`title`}},w={args:{initialFocus:`close`}},T={args:{description:`The new name appears everywhere the project is listed.`}},E={args:{hideHeading:!0}},D={args:{dismissible:!1}},O={render:e=>m(e,i`<ds-text>Press the question mark key anywhere to reopen this list.</ds-text>`,void 0),args:{heading:`Keyboard shortcuts`}},k={args:{open:!0,heading:`Rename project`},render:e=>m(e,h,g)},A={args:{open:!0,heading:`Invite people`,size:`sm`},render:e=>m(e,i`
        <ds-stack gap="normal">
          <ds-input type="email" label="Email" name="email"></ds-input>
          <ds-select
            label="Role"
            name="role"
            .options=${[{value:`member`,label:`Member`},{value:`admin`,label:`Admin`}]}
          ></ds-select>
        </ds-stack>
      `,i`
        <ds-button slot="footer" variant="primary" label="Send invites" @press=${f}></ds-button>
        <ds-button slot="footer" variant="secondary" label="Cancel" @press=${f}></ds-button>
      `)},j={args:{open:!0,heading:`Choose a plan`,description:`You need a plan before you can invite anyone.`,dismissible:!1},render:e=>m(e,i`<ds-radio-group
        label="Plan"
        name="plan"
        .options=${[{value:`free`,label:`Free`},{value:`team`,label:`Team`},{value:`business`,label:`Business`}]}
      ></ds-radio-group>`,i`<ds-button slot="footer" variant="primary" label="Continue" @press=${f}></ds-button>`)},M={args:{open:!0,heading:`Terms of service`,size:`lg`,initialFocus:`title`},render:e=>m(e,i`
        <ds-stack gap="normal">
          <ds-text>These terms govern your use of the service and any content you create with it.</ds-text>
          <ds-text>You keep ownership of your content. You grant us the rights needed to host and display it.</ds-text>
          <ds-text>We may update these terms. We will tell you before changes take effect.</ds-text>
          <ds-text>You can close your account at any time. Your content is deleted thirty days later.</ds-text>
        </ds-stack>
      `,void 0)},N={render:e=>m(e,h,g)},P=[`Default`,`SizeSm`,`SizeMd`,`SizeLg`,`InitialFocusFirst`,`InitialFocusTitle`,`InitialFocusClose`,`WithDescription`,`HideHeading`,`NotDismissible`,`NoFooter`,`RenameProject`,`InvitePeople`,`MustBeAnswered`,`ReadingDialog`,`Keyboard`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'first'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'title'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'close'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'The new name appears everywhere the project is listed.'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => renderDialog(args, html\`<ds-text>Press the question mark key anywhere to reopen this list.</ds-text>\`, undefined),
  args: {
    heading: 'Keyboard shortcuts'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Rename project'
  },
  render: args => renderDialog(args, renameBody, renameFooter)
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Invite people',
    size: 'sm'
  },
  render: args => renderDialog(args, html\`
        <ds-stack gap="normal">
          <ds-input type="email" label="Email" name="email"></ds-input>
          <ds-select
            label="Role"
            name="role"
            .options=\${[{
    value: 'member',
    label: 'Member'
  }, {
    value: 'admin',
    label: 'Admin'
  }]}
          ></ds-select>
        </ds-stack>
      \`, html\`
        <ds-button slot="footer" variant="primary" label="Send invites" @press=\${closeDialog}></ds-button>
        <ds-button slot="footer" variant="secondary" label="Cancel" @press=\${closeDialog}></ds-button>
      \`)
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Choose a plan',
    description: 'You need a plan before you can invite anyone.',
    dismissible: false
  },
  render: args => renderDialog(args, html\`<ds-radio-group
        label="Plan"
        name="plan"
        .options=\${[{
    value: 'free',
    label: 'Free'
  }, {
    value: 'team',
    label: 'Team'
  }, {
    value: 'business',
    label: 'Business'
  }]}
      ></ds-radio-group>\`, html\`<ds-button slot="footer" variant="primary" label="Continue" @press=\${closeDialog}></ds-button>\`)
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Terms of service',
    size: 'lg',
    initialFocus: 'title'
  },
  render: args => renderDialog(args, html\`
        <ds-stack gap="normal">
          <ds-text>These terms govern your use of the service and any content you create with it.</ds-text>
          <ds-text>You keep ownership of your content. You grant us the rights needed to host and display it.</ds-text>
          <ds-text>We may update these terms. We will tell you before changes take effect.</ds-text>
          <ds-text>You can close your account at any time. Your content is deleted thirty days later.</ds-text>
        </ds-stack>
      \`, undefined)
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => renderDialog(args, renameBody, renameFooter)
}`,...N.parameters?.docs?.source},description:{story:`Open with its trigger and at least three focusable children (the close button, the input and\r
two footer buttons), so the keyboard gate can check Escape and Tab / Shift+Tab wrapping.`,...N.parameters?.docs?.description}}}})))()}F();export{v as Default,E as HideHeading,w as InitialFocusClose,S as InitialFocusFirst,C as InitialFocusTitle,A as InvitePeople,N as Keyboard,j as MustBeAnswered,O as NoFooter,D as NotDismissible,M as ReadingDialog,k as RenameProject,x as SizeLg,b as SizeMd,y as SizeSm,T as WithDescription,P as __namedExportsOrder,_ as default};