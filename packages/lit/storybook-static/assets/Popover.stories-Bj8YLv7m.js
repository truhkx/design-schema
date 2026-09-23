import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Icon-eWCe5jE3.js";import{t as o}from"./Text-b_nq3K9L.js";import{t as s}from"./Button-B3rVveNU.js";import{t as c}from"./Input-C44YOz46.js";import{t as l}from"./Link-CzFgI_Cj.js";import{t as u}from"./Stack-CZci_zJ9.js";import{t as d}from"./Box-Cbe3zAzP.js";import{t as f}from"./Checkbox-cHwY3d7l.js";import{t as p}from"./Popover-DqgQP74q.js";import{M as m,j as h}from"./iframe-C6sywzE2.js";function g(e){e.currentTarget.open=e.detail.open}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{t(),r(),p(),d(),s(),f(),m(),a(),c(),l(),u(),h(),o(),_=i`
  <ds-form label="Filters" name="filters">
    <ds-stack gap="normal">
      <ds-switch label="Only open items" name="openOnly"></ds-switch>
      <ds-switch label="Assigned to me" name="mine"></ds-switch>
    </ds-stack>
    <ds-button slot="actions" type="submit" variant="primary" size="sm" label="Apply"></ds-button>
  </ds-form>
`,v={title:`Popover/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`open-change`]}},args:{trigger:`A Filters Button`,children:"A Form of filter controls with an Apply Button in the Form's `actions`",heading:`Filters`,headingLevel:`3`,placement:`bottom-start`,modal:!1,showArrow:!1,dismissible:!0,initialFocus:`first`},argTypes:{trigger:{control:!1},children:{control:!1},headingLevel:{control:`inline-radio`,options:[`2`,`3`,`4`]},placement:{control:`select`,options:[`bottom-start`,`bottom`,`bottom-end`,`top-start`,`top`,`top-end`,`start`,`end`]},modal:{control:`boolean`},showArrow:{control:`boolean`},dismissible:{control:`boolean`},initialFocus:{control:`inline-radio`,options:[`first`,`none`]},open:{control:`boolean`}},render:e=>i`
    <ds-popover
      heading=${n(e.heading)}
      heading-level=${e.headingLevel??`3`}
      initial-focus=${e.initialFocus??`first`}
      placement=${e.placement??`bottom`}
      ?modal=${e.modal??!1}
      ?show-arrow=${e.showArrow??!1}
      ?no-dismiss=${e.dismissible===!1}
      ?open=${e.open??!0}
      @open-change=${g}
    >
      <ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>
      ${_}
    </ds-popover>
  `},y={args:{open:!0}},b={args:{headingLevel:`2`}},x={args:{headingLevel:`3`}},S={args:{headingLevel:`4`}},C={args:{placement:`bottom-start`}},w={args:{placement:`bottom`}},T={args:{placement:`bottom-end`}},E={args:{placement:`top-start`}},D={args:{placement:`top`}},O={args:{placement:`top-end`}},k={args:{placement:`start`}},A={args:{placement:`end`}},j={args:{initialFocus:`first`}},M={args:{initialFocus:`none`}},N={args:{dismissible:!1}},P={args:{showArrow:!0}},F={args:{modal:!0}},I={args:{trigger:`A Filters Button`,children:"A Form of filter controls with an Apply Button in the Form's `actions`",heading:`Filters`,headingLevel:`3`,placement:`bottom-start`,modal:!1,showArrow:!1,dismissible:!0,initialFocus:`first`,open:void 0},render:e=>i`
    <ds-popover
      heading=${n(e.heading)}
      heading-level=${e.headingLevel??`3`}
      initial-focus=${e.initialFocus??`first`}
      placement=${e.placement??`bottom`}
      ?modal=${e.modal??!1}
      ?show-arrow=${e.showArrow??!1}
      ?no-dismiss=${e.dismissible===!1}
    >
      <ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>
      ${_}
    </ds-popover>
  `},L={args:{trigger:`A date field Button with the calendar Icon labelled with the literal date "16 September 2026" (the story does not compute today, and every platform uses that same string)`,children:`Three quick-pick date Buttons: Today, Tomorrow, Next week`,heading:void 0,headingLevel:`3`,placement:`bottom`,modal:!1,showArrow:!1,dismissible:!0,initialFocus:`first`,open:void 0},render:e=>i`
    <ds-popover
      heading=${n(e.heading)}
      heading-level=${e.headingLevel??`3`}
      initial-focus=${e.initialFocus??`first`}
      placement=${e.placement??`bottom`}
      ?modal=${e.modal??!1}
      ?show-arrow=${e.showArrow??!1}
      ?no-dismiss=${e.dismissible===!1}
    >
      <ds-button slot="trigger" variant="secondary" label="16 September 2026">
        <ds-icon slot="leading-icon" name="calendar"></ds-icon>
      </ds-button>
      <ds-stack gap="tight">
        <ds-button variant="ghost" size="sm" label="Today"></ds-button>
        <ds-button variant="ghost" size="sm" label="Tomorrow"></ds-button>
        <ds-button variant="ghost" size="sm" label="Next week"></ds-button>
      </ds-stack>
    </ds-popover>
  `},R={args:{trigger:`An Add member Button`,children:"A Form with an email Input and a Save Button in the Form's `actions`",heading:`Add member`,headingLevel:`3`,placement:`bottom`,modal:!0,showArrow:!1,dismissible:!0,initialFocus:`first`,open:void 0},render:e=>i`
    <ds-popover
      heading=${n(e.heading)}
      heading-level=${e.headingLevel??`3`}
      initial-focus=${e.initialFocus??`first`}
      placement=${e.placement??`bottom`}
      ?modal=${e.modal??!1}
      ?show-arrow=${e.showArrow??!1}
      ?no-dismiss=${e.dismissible===!1}
    >
      <ds-button slot="trigger" variant="secondary" label="Add member"></ds-button>
      <ds-form label="Add member" name="add-member">
        <ds-input label="Email" name="email" type="email" required></ds-input>
        <ds-button slot="actions" type="submit" variant="primary" size="sm" label="Save"></ds-button>
      </ds-form>
    </ds-popover>
  `},z={args:{trigger:`An icon-only Button labelled "Help" with the info Icon`,children:`One sentence of help ending in a Link to the guide`,heading:void 0,headingLevel:`3`,placement:`end`,modal:!1,showArrow:!0,dismissible:!0,initialFocus:`first`,open:void 0},render:e=>i`
    <ds-popover
      heading=${n(e.heading)}
      heading-level=${e.headingLevel??`3`}
      initial-focus=${e.initialFocus??`first`}
      placement=${e.placement??`bottom`}
      ?modal=${e.modal??!1}
      ?show-arrow=${e.showArrow??!1}
      ?no-dismiss=${e.dismissible===!1}
    >
      <ds-button slot="trigger" variant="ghost" icon-only label="Help">
        <ds-icon slot="leading-icon" name="info"></ds-icon>
      </ds-button>
      <ds-text size="sm">
        Filters apply to every view in this project. <ds-link href="#" label="Read the guide"></ds-link>
      </ds-text>
    </ds-popover>
  `},B={args:{open:!0,modal:!1},render:e=>i`
    <ds-popover
      heading=${n(e.heading)}
      heading-level=${e.headingLevel??`3`}
      initial-focus=${e.initialFocus??`first`}
      placement=${e.placement??`bottom`}
      ?modal=${e.modal??!1}
      ?show-arrow=${e.showArrow??!1}
      ?no-dismiss=${e.dismissible===!1}
      ?open=${e.open??!0}
      @open-change=${g}
    >
      <ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>
      <ds-stack gap="normal">
        <ds-button variant="secondary" size="sm" label="7 days"></ds-button>
        <ds-button variant="secondary" size="sm" label="30 days"></ds-button>
        <ds-button variant="secondary" size="sm" label="90 days"></ds-button>
      </ds-stack>
    </ds-popover>
  `},V=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`PlacementBottomStart`,`PlacementBottom`,`PlacementBottomEnd`,`PlacementTopStart`,`PlacementTop`,`PlacementTopEnd`,`PlacementStart`,`PlacementEnd`,`InitialFocusFirst`,`InitialFocusNone`,`NotDismissible`,`WithArrow`,`Modal`,`FilterPanel`,`DatePickerPanel`,`RequiredStep`,`ContextualHelp`,`Keyboard`],y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...y.parameters?.docs?.source},description:{story:`Open, with the filter-panel example's args, so the derived scenarios find the named panel.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-start'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-end'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-start'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-end'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'first'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'none'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    showArrow: true
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    modal: true
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: 'A Filters Button',
    children: "A Form of filter controls with an Apply Button in the Form's \`actions\`",
    heading: 'Filters',
    headingLevel: '3',
    placement: 'bottom-start',
    modal: false,
    showArrow: false,
    dismissible: true,
    initialFocus: 'first',
    open: undefined
  },
  render: args => html\`
    <ds-popover
      heading=\${ifDefined(args.heading)}
      heading-level=\${args.headingLevel ?? '3'}
      initial-focus=\${args.initialFocus ?? 'first'}
      placement=\${args.placement ?? 'bottom'}
      ?modal=\${args.modal ?? false}
      ?show-arrow=\${args.showArrow ?? false}
      ?no-dismiss=\${args.dismissible === false}
    >
      <ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>
      \${filterForm}
    </ds-popover>
  \`
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: 'A date field Button with the calendar Icon labelled with the literal date "16 September 2026" (the story does not compute today, and every platform uses that same string)',
    children: 'Three quick-pick date Buttons: Today, Tomorrow, Next week',
    heading: undefined,
    headingLevel: '3',
    placement: 'bottom',
    modal: false,
    showArrow: false,
    dismissible: true,
    initialFocus: 'first',
    open: undefined
  },
  render: args => html\`
    <ds-popover
      heading=\${ifDefined(args.heading)}
      heading-level=\${args.headingLevel ?? '3'}
      initial-focus=\${args.initialFocus ?? 'first'}
      placement=\${args.placement ?? 'bottom'}
      ?modal=\${args.modal ?? false}
      ?show-arrow=\${args.showArrow ?? false}
      ?no-dismiss=\${args.dismissible === false}
    >
      <ds-button slot="trigger" variant="secondary" label="16 September 2026">
        <ds-icon slot="leading-icon" name="calendar"></ds-icon>
      </ds-button>
      <ds-stack gap="tight">
        <ds-button variant="ghost" size="sm" label="Today"></ds-button>
        <ds-button variant="ghost" size="sm" label="Tomorrow"></ds-button>
        <ds-button variant="ghost" size="sm" label="Next week"></ds-button>
      </ds-stack>
    </ds-popover>
  \`
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: 'An Add member Button',
    children: "A Form with an email Input and a Save Button in the Form's \`actions\`",
    heading: 'Add member',
    headingLevel: '3',
    placement: 'bottom',
    modal: true,
    showArrow: false,
    dismissible: true,
    initialFocus: 'first',
    open: undefined
  },
  render: args => html\`
    <ds-popover
      heading=\${ifDefined(args.heading)}
      heading-level=\${args.headingLevel ?? '3'}
      initial-focus=\${args.initialFocus ?? 'first'}
      placement=\${args.placement ?? 'bottom'}
      ?modal=\${args.modal ?? false}
      ?show-arrow=\${args.showArrow ?? false}
      ?no-dismiss=\${args.dismissible === false}
    >
      <ds-button slot="trigger" variant="secondary" label="Add member"></ds-button>
      <ds-form label="Add member" name="add-member">
        <ds-input label="Email" name="email" type="email" required></ds-input>
        <ds-button slot="actions" type="submit" variant="primary" size="sm" label="Save"></ds-button>
      </ds-form>
    </ds-popover>
  \`
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: 'An icon-only Button labelled "Help" with the info Icon',
    children: 'One sentence of help ending in a Link to the guide',
    heading: undefined,
    headingLevel: '3',
    placement: 'end',
    modal: false,
    showArrow: true,
    dismissible: true,
    initialFocus: 'first',
    open: undefined
  },
  render: args => html\`
    <ds-popover
      heading=\${ifDefined(args.heading)}
      heading-level=\${args.headingLevel ?? '3'}
      initial-focus=\${args.initialFocus ?? 'first'}
      placement=\${args.placement ?? 'bottom'}
      ?modal=\${args.modal ?? false}
      ?show-arrow=\${args.showArrow ?? false}
      ?no-dismiss=\${args.dismissible === false}
    >
      <ds-button slot="trigger" variant="ghost" icon-only label="Help">
        <ds-icon slot="leading-icon" name="info"></ds-icon>
      </ds-button>
      <ds-text size="sm">
        Filters apply to every view in this project. <ds-link href="#" label="Read the guide"></ds-link>
      </ds-text>
    </ds-popover>
  \`
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    modal: false
  },
  render: args => html\`
    <ds-popover
      heading=\${ifDefined(args.heading)}
      heading-level=\${args.headingLevel ?? '3'}
      initial-focus=\${args.initialFocus ?? 'first'}
      placement=\${args.placement ?? 'bottom'}
      ?modal=\${args.modal ?? false}
      ?show-arrow=\${args.showArrow ?? false}
      ?no-dismiss=\${args.dismissible === false}
      ?open=\${args.open ?? true}
      @open-change=\${followOpenChange}
    >
      <ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>
      <ds-stack gap="normal">
        <ds-button variant="secondary" size="sm" label="7 days"></ds-button>
        <ds-button variant="secondary" size="sm" label="30 days"></ds-button>
        <ds-button variant="secondary" size="sm" label="90 days"></ds-button>
      </ds-stack>
    </ds-popover>
  \`
}`,...B.parameters?.docs?.source},description:{story:`Open with its trigger and three focusable body children, for the keyboard gate.`,...B.parameters?.docs?.description}}}})))()}H();export{z as ContextualHelp,L as DatePickerPanel,y as Default,I as FilterPanel,b as HeadingLevel2,x as HeadingLevel3,S as HeadingLevel4,j as InitialFocusFirst,M as InitialFocusNone,B as Keyboard,F as Modal,N as NotDismissible,w as PlacementBottom,T as PlacementBottomEnd,C as PlacementBottomStart,A as PlacementEnd,k as PlacementStart,D as PlacementTop,O as PlacementTopEnd,E as PlacementTopStart,R as RequiredStep,P as WithArrow,V as __namedExportsOrder,v as default};