import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Button-TSn-G4Vm.js";import{t as o}from"./Text-Dgpz9DWN.js";import{t as s}from"./Input-BGhC2i8R.js";import{t as c}from"./Link-CFGwxdql.js";import{t as l}from"./Popover-CSjz9iBj.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{t(),i(),l(),a(),s(),o(),c(),u={title:`Popover/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`open-change`]}},argTypes:{placement:{control:`select`,options:[`bottom-start`,`bottom`,`bottom-end`,`top-start`,`top`,`top-end`,`start`,`end`]},headingLevel:{control:`select`,options:[`2`,`3`,`4`]}},args:{heading:`Filters`,headingLevel:`3`,placement:`bottom`,modal:!1,showArrow:!1,dismissible:!0},render:e=>n`
    <ds-popover
      heading=${r(e.heading)}
      heading-level=${e.headingLevel}
      placement=${e.placement}
      ?modal=${e.modal}
      ?show-arrow=${e.showArrow}
      .dismissible=${e.dismissible}
      ?open=${e.open}
    >
      <ds-button slot="trigger" variant="secondary" size="sm" label="Filters"></ds-button>
      <ds-text size="sm" tone="muted">Show items matching every condition below.</ds-text>
      <ds-input label="Status" name="status" value="Active"></ds-input>
      <ds-button variant="primary" size="sm" label="Apply"></ds-button>
    </ds-popover>
  `},d={},f={args:{headingLevel:`2`,open:!0}},p={args:{headingLevel:`3`,open:!0}},m={args:{headingLevel:`4`,open:!0}},h={args:{placement:`bottom-start`,open:!0}},g={args:{placement:`bottom`,open:!0}},_={args:{placement:`bottom-end`,open:!0}},v={args:{placement:`top-start`,open:!0}},y={args:{placement:`top`,open:!0}},b={args:{placement:`top-end`,open:!0}},x={args:{placement:`start`,open:!0}},S={args:{placement:`end`,open:!0}},C={args:{open:!0,modal:!0,heading:`Confirm export`},render:e=>n`
    <ds-popover
      heading=${r(e.heading)}
      placement=${e.placement}
      ?modal=${e.modal}
      ?show-arrow=${e.showArrow}
      .dismissible=${e.dismissible}
      ?open=${e.open}
    >
      <ds-button slot="trigger" variant="secondary" size="sm" label="Export"></ds-button>
      <ds-text size="sm">This can't be undone once started.</ds-text>
      <ds-button variant="primary" size="sm" label="Start export"></ds-button>
    </ds-popover>
  `},w={args:{open:!0,showArrow:!0}},T={args:{open:!0,dismissible:!1}},E={args:{heading:void 0,open:!0},render:e=>n`
    <ds-popover
      placement=${e.placement}
      ?modal=${e.modal}
      ?show-arrow=${e.showArrow}
      .dismissible=${e.dismissible}
      ?open=${e.open}
    >
      <ds-button slot="trigger" variant="secondary" size="sm" label="Share this page"></ds-button>
      <ds-link href="#">Copy link</ds-link>
    </ds-popover>
  `},D={args:{open:!0},render:e=>n`
    <ds-popover
      heading=${r(e.heading)}
      placement=${e.placement}
      ?modal=${e.modal}
      ?show-arrow=${e.showArrow}
      .dismissible=${e.dismissible}
      ?open=${e.open}
    >
      <ds-button slot="trigger" variant="secondary" size="sm" label="Filters"></ds-button>
      <ds-input label="Status" name="status" value="Active"></ds-input>
      <ds-input label="Owner" name="owner" value="Me"></ds-input>
      <ds-button variant="primary" size="sm" label="Apply"></ds-button>
    </ds-popover>
  `},O=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`PlacementBottomStart`,`PlacementBottom`,`PlacementBottomEnd`,`PlacementTopStart`,`PlacementTop`,`PlacementTopEnd`,`PlacementStart`,`PlacementEnd`,`ModalTrue`,`ShowArrowTrue`,`DismissibleFalse`,`NoHeading`,`Keyboard`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2',
    open: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3',
    open: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4',
    open: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-start',
    open: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom',
    open: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-end',
    open: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-start',
    open: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top',
    open: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-end',
    open: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start',
    open: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end',
    open: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    modal: true,
    heading: 'Confirm export'
  },
  render: args => html\`
    <ds-popover
      heading=\${ifDefined(args.heading)}
      placement=\${args.placement}
      ?modal=\${args.modal}
      ?show-arrow=\${args.showArrow}
      .dismissible=\${args.dismissible}
      ?open=\${args.open}
    >
      <ds-button slot="trigger" variant="secondary" size="sm" label="Export"></ds-button>
      <ds-text size="sm">This can't be undone once started.</ds-text>
      <ds-button variant="primary" size="sm" label="Start export"></ds-button>
    </ds-popover>
  \`
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    showArrow: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    dismissible: false
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    heading: undefined,
    open: true
  },
  render: args => html\`
    <ds-popover
      placement=\${args.placement}
      ?modal=\${args.modal}
      ?show-arrow=\${args.showArrow}
      .dismissible=\${args.dismissible}
      ?open=\${args.open}
    >
      <ds-button slot="trigger" variant="secondary" size="sm" label="Share this page"></ds-button>
      <ds-link href="#">Copy link</ds-link>
    </ds-popover>
  \`
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  render: args => html\`
    <ds-popover
      heading=\${ifDefined(args.heading)}
      placement=\${args.placement}
      ?modal=\${args.modal}
      ?show-arrow=\${args.showArrow}
      .dismissible=\${args.dismissible}
      ?open=\${args.open}
    >
      <ds-button slot="trigger" variant="secondary" size="sm" label="Filters"></ds-button>
      <ds-input label="Status" name="status" value="Active"></ds-input>
      <ds-input label="Owner" name="owner" value="Me"></ds-input>
      <ds-button variant="primary" size="sm" label="Apply"></ds-button>
    </ds-popover>
  \`
}`,...D.parameters?.docs?.source},description:{story:`Renders open with its trigger and at least three focusable children so the\r
keyboard gate can verify Tab/Shift+Tab out and Escape.`,...D.parameters?.docs?.description}}}})))()}k();export{d as Default,T as DismissibleFalse,f as HeadingLevel2,p as HeadingLevel3,m as HeadingLevel4,D as Keyboard,C as ModalTrue,E as NoHeading,g as PlacementBottom,_ as PlacementBottomEnd,h as PlacementBottomStart,S as PlacementEnd,x as PlacementStart,y as PlacementTop,b as PlacementTopEnd,v as PlacementTopStart,w as ShowArrowTrue,O as __namedExportsOrder,u as default};