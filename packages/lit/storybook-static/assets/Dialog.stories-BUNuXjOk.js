import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Text-BrJPDVza.js";import{t as o}from"./Button-DJvb7DFH.js";import{t as s}from"./Input-DW6UoXDO.js";import{t as c}from"./Stack-CZci_zJ9.js";import{t as l}from"./Dialog-BmqjLOxw.js";import{t as u}from"./Select-CR8lS8kO.js";import{A as d}from"./iframe-CV6aZYyO.js";function f(e){let t=e.currentTarget.closest(`ds-dialog`);t&&(t.open=!1)}function p(e){let t=e.currentTarget.nextElementSibling;t&&(t.open=!0)}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{t(),r(),l(),o(),s(),a(),d(),u(),c(),m={title:`Dialog/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`close`,`opened`]}},argTypes:{size:{control:`inline-radio`,options:[`sm`,`md`,`lg`]},initialFocus:{control:`inline-radio`,options:[`first`,`title`,`close`]}},args:{open:!0,heading:`Rename project`,hideHeading:!1,size:`md`,dismissible:!0,initialFocus:`first`},render:e=>i`
    <ds-button label=${e.heading} @press=${p}></ds-button>
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
      <ds-input label="Project name" name="projectName" default-value="Q3 roadmap"></ds-input>
      <ds-button slot="footer" variant="primary" label="Rename" @press=${f}></ds-button>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=${f}></ds-button>
    </ds-dialog>
  `},h={},g={args:{size:`sm`}},_={args:{size:`md`}},v={args:{size:`lg`}},y={args:{initialFocus:`first`}},b={args:{initialFocus:`title`}},x={args:{initialFocus:`close`}},S={args:{hideHeading:!0}},C={args:{description:`Everyone with access will see the new name.`}},w={args:{dismissible:!1}},T={args:{open:!1}},E={args:{open:!0},render:e=>i`
    <ds-button label=${e.heading} @press=${p}></ds-button>
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
      <ds-stack gap="normal">
        <ds-input label="Project name" name="projectName" default-value="Q3 roadmap"></ds-input>
        <ds-input label="Slug" name="slug" default-value="q3-roadmap"></ds-input>
      </ds-stack>
      <ds-button slot="footer" variant="primary" label="Rename" @press=${f}></ds-button>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=${f}></ds-button>
    </ds-dialog>
  `},D={args:{open:!0,heading:`Rename project`},render:e=>i`
    <ds-button label=${e.heading} @press=${p}></ds-button>
    <ds-dialog
      ?open=${e.open}
      heading=${e.heading}
      size=${e.size??`md`}
      initial-focus=${e.initialFocus??`first`}
      @close=${f}
    >
      <ds-input label="Project name" name="projectName" default-value="Q3 roadmap"></ds-input>
      <ds-button slot="footer" variant="primary" label="Rename" @press=${f}></ds-button>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=${f}></ds-button>
    </ds-dialog>
  `},O={args:{open:!0,heading:`Invite people`,size:`sm`},render:e=>i`
    <ds-button label=${e.heading} @press=${p}></ds-button>
    <ds-dialog
      ?open=${e.open}
      heading=${e.heading}
      size=${e.size??`md`}
      initial-focus=${e.initialFocus??`first`}
      @close=${f}
    >
      <ds-stack gap="normal">
        <ds-input type="email" label="Email" name="email"></ds-input>
        <ds-select
          label="Role"
          name="role"
          .defaultValue=${`member`}
          .options=${[{value:`member`,label:`Member`},{value:`admin`,label:`Admin`}]}
        ></ds-select>
      </ds-stack>
      <ds-button slot="footer" variant="primary" label="Send invites" @press=${f}></ds-button>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=${f}></ds-button>
    </ds-dialog>
  `},k={args:{open:!0,heading:`Choose a plan`,description:`You need a plan before you can invite anyone.`,dismissible:!1},render:e=>i`
    <ds-button label=${e.heading} @press=${p}></ds-button>
    <ds-dialog
      ?open=${e.open}
      heading=${e.heading}
      description=${n(e.description)}
      size=${e.size??`md`}
      ?no-dismiss=${e.dismissible===!1}
      initial-focus=${e.initialFocus??`first`}
      @close=${f}
    >
      <ds-radio-group
        label="Plan"
        name="plan"
        .options=${[{value:`starter`,label:`Starter`},{value:`team`,label:`Team`},{value:`business`,label:`Business`}]}
      ></ds-radio-group>
      <ds-button slot="footer" variant="primary" label="Continue" @press=${f}></ds-button>
    </ds-dialog>
  `},A={args:{open:!0,heading:`Terms of service`,size:`lg`,initialFocus:`title`},render:e=>i`
    <ds-button label=${e.heading} @press=${p}></ds-button>
    <ds-dialog
      ?open=${e.open}
      heading=${e.heading}
      size=${e.size??`md`}
      initial-focus=${e.initialFocus??`first`}
      @close=${f}
    >
      <ds-stack gap="normal">
        <ds-text>These terms govern your use of the service and any content you create with it.</ds-text>
        <ds-text
          >You keep ownership of your content. You grant us the rights needed to host and display it to the people you
          share it with.</ds-text
        >
        <ds-text>We may update these terms. When we do, we will tell you before the changes take effect.</ds-text>
        <ds-text>You can close your account at any time. Your content is deleted thirty days after closure.</ds-text>
      </ds-stack>
    </ds-dialog>
  `},j=[`Default`,`SizeSm`,`SizeMd`,`SizeLg`,`InitialFocusFirst`,`InitialFocusTitle`,`InitialFocusClose`,`HideHeading`,`WithDescription`,`NotDismissible`,`Closed`,`Keyboard`,`RenameProject`,`InvitePeople`,`MustBeAnswered`,`ReadingDialog`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'first'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'title'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'close'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Everyone with access will see the new name.'
  }
}`,...C.parameters?.docs?.source},description:{story:`The description is one sentence of consequence under the title, and the accessible description.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openDialog}></ds-button>
    <ds-dialog
      ?open=\${args.open}
      heading=\${args.heading}
      description=\${ifDefined(args.description)}
      ?hide-heading=\${args.hideHeading ?? false}
      size=\${args.size ?? 'md'}
      ?no-dismiss=\${args.dismissible === false}
      initial-focus=\${args.initialFocus ?? 'first'}
      @close=\${closeDialog}
    >
      <ds-stack gap="normal">
        <ds-input label="Project name" name="projectName" default-value="Q3 roadmap"></ds-input>
        <ds-input label="Slug" name="slug" default-value="q3-roadmap"></ds-input>
      </ds-stack>
      <ds-button slot="footer" variant="primary" label="Rename" @press=\${closeDialog}></ds-button>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=\${closeDialog}></ds-button>
    </ds-dialog>
  \`
}`,...E.parameters?.docs?.source},description:{story:`Open with its trigger and more than three focusable children, for the keyboard gate.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Rename project'
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openDialog}></ds-button>
    <ds-dialog
      ?open=\${args.open}
      heading=\${args.heading}
      size=\${args.size ?? 'md'}
      initial-focus=\${args.initialFocus ?? 'first'}
      @close=\${closeDialog}
    >
      <ds-input label="Project name" name="projectName" default-value="Q3 roadmap"></ds-input>
      <ds-button slot="footer" variant="primary" label="Rename" @press=\${closeDialog}></ds-button>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=\${closeDialog}></ds-button>
    </ds-dialog>
  \`
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Invite people',
    size: 'sm'
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openDialog}></ds-button>
    <ds-dialog
      ?open=\${args.open}
      heading=\${args.heading}
      size=\${args.size ?? 'md'}
      initial-focus=\${args.initialFocus ?? 'first'}
      @close=\${closeDialog}
    >
      <ds-stack gap="normal">
        <ds-input type="email" label="Email" name="email"></ds-input>
        <ds-select
          label="Role"
          name="role"
          .defaultValue=\${'member'}
          .options=\${[{
    value: 'member',
    label: 'Member'
  }, {
    value: 'admin',
    label: 'Admin'
  }]}
        ></ds-select>
      </ds-stack>
      <ds-button slot="footer" variant="primary" label="Send invites" @press=\${closeDialog}></ds-button>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=\${closeDialog}></ds-button>
    </ds-dialog>
  \`
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Choose a plan',
    description: 'You need a plan before you can invite anyone.',
    dismissible: false
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openDialog}></ds-button>
    <ds-dialog
      ?open=\${args.open}
      heading=\${args.heading}
      description=\${ifDefined(args.description)}
      size=\${args.size ?? 'md'}
      ?no-dismiss=\${args.dismissible === false}
      initial-focus=\${args.initialFocus ?? 'first'}
      @close=\${closeDialog}
    >
      <ds-radio-group
        label="Plan"
        name="plan"
        .options=\${[{
    value: 'starter',
    label: 'Starter'
  }, {
    value: 'team',
    label: 'Team'
  }, {
    value: 'business',
    label: 'Business'
  }]}
      ></ds-radio-group>
      <ds-button slot="footer" variant="primary" label="Continue" @press=\${closeDialog}></ds-button>
    </ds-dialog>
  \`
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Terms of service',
    size: 'lg',
    initialFocus: 'title'
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openDialog}></ds-button>
    <ds-dialog
      ?open=\${args.open}
      heading=\${args.heading}
      size=\${args.size ?? 'md'}
      initial-focus=\${args.initialFocus ?? 'first'}
      @close=\${closeDialog}
    >
      <ds-stack gap="normal">
        <ds-text>These terms govern your use of the service and any content you create with it.</ds-text>
        <ds-text
          >You keep ownership of your content. You grant us the rights needed to host and display it to the people you
          share it with.</ds-text
        >
        <ds-text>We may update these terms. When we do, we will tell you before the changes take effect.</ds-text>
        <ds-text>You can close your account at any time. Your content is deleted thirty days after closure.</ds-text>
      </ds-stack>
    </ds-dialog>
  \`
}`,...A.parameters?.docs?.source}}}})))()}M();export{T as Closed,h as Default,S as HideHeading,x as InitialFocusClose,y as InitialFocusFirst,b as InitialFocusTitle,O as InvitePeople,E as Keyboard,k as MustBeAnswered,w as NotDismissible,A as ReadingDialog,D as RenameProject,v as SizeLg,_ as SizeMd,g as SizeSm,C as WithDescription,j as __namedExportsOrder,m as default};