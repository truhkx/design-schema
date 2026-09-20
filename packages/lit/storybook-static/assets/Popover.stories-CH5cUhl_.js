import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Icon-BHsrajXm.js";import{t as o}from"./Text-BrJPDVza.js";import{t as s}from"./Button-CG4k9eqY.js";import{t as c}from"./Input-BhbKtdVo.js";import{t as l}from"./Link-EdDzPEMK.js";import{t as u}from"./Stack-CZci_zJ9.js";import{t as d}from"./Checkbox-DkY-7lZq.js";import{t as f}from"./Popover-DY5oJ08g.js";import{M as p}from"./iframe-B0T1LYjz.js";function m(e){if(e.open!==void 0)return e=>{e.currentTarget.open=e.detail.open}}function h(e,t,r){return i`
    <ds-popover
      heading=${n(e.heading)}
      heading-level=${n(e.headingLevel)}
      placement=${n(e.placement)}
      ?modal=${e.modal??!1}
      ?show-arrow=${e.showArrow??!1}
      .dismissible=${e.dismissible??!0}
      .open=${e.open}
      @open-change=${n(m(e))}
    >
      ${t}
      ${r}
    </ds-popover>
  `}var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{t(),r(),f(),s(),a(),c(),d(),p(),u(),o(),l(),g=i`<ds-button slot="trigger" variant="secondary" size="sm" label="Filters"></ds-button>`,_=i`
  <ds-form label="Filters" name="filters">
    <ds-stack gap="normal">
      <ds-checkbox label="Open issues" name="open-issues" default-checked></ds-checkbox>
      <ds-checkbox label="Assigned to me" name="assigned"></ds-checkbox>
    </ds-stack>
    <ds-button slot="actions" type="submit" variant="primary" size="sm" label="Apply"></ds-button>
  </ds-form>
`,v={trigger:`A Filters Button`,children:`A Form of filter controls`,heading:`Filters`,placement:`bottom-start`},y={title:`Popover/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`open-change`]}},argTypes:{placement:{control:`select`,options:[`bottom-start`,`bottom`,`bottom-end`,`top-start`,`top`,`top-end`,`start`,`end`]},headingLevel:{control:`select`,options:[`2`,`3`,`4`]},modal:{control:`boolean`},showArrow:{control:`boolean`},dismissible:{control:`boolean`},open:{control:`boolean`}},render:e=>h(e,g,_)},b={args:{...v,open:!0}},x={args:{heading:`Filters`,headingLevel:`2`,open:!0}},S={args:{heading:`Filters`,headingLevel:`3`,open:!0}},C={args:{heading:`Filters`,headingLevel:`4`,open:!0}},w={args:{placement:`bottom-start`,open:!0}},T={args:{placement:`bottom`,open:!0}},E={args:{placement:`bottom-end`,open:!0}},D={args:{placement:`top-start`,open:!0}},O={args:{placement:`top`,open:!0}},k={args:{placement:`top-end`,open:!0}},A={args:{placement:`start`,open:!0}},j={args:{placement:`end`,open:!0}},M={args:{heading:`Filters`,modal:!0,open:!0}},N={args:{showArrow:!0,open:!0}},P={args:{dismissible:!1,open:!0}},F={args:{heading:`Filters`}},I={args:{...v,open:!0,modal:!1}},L={args:v},R={args:{trigger:`A date field Button with the calendar Icon showing the current date`,children:`Three quick-pick date Buttons: Today, Tomorrow, Next week`},render:e=>h(e,i`<ds-button slot="trigger" variant="secondary" size="sm" label=${new Date().toLocaleDateString()}>
        <ds-icon slot="leading-icon" name="calendar"></ds-icon>
      </ds-button>`,i`
        <ds-stack gap="tight">
          <ds-button variant="ghost" size="sm" label="Today"></ds-button>
          <ds-button variant="ghost" size="sm" label="Tomorrow"></ds-button>
          <ds-button variant="ghost" size="sm" label="Next week"></ds-button>
        </ds-stack>
      `)},z={args:{trigger:`An Add member Button`,children:`An email Input and a Save Button`,heading:`Add member`,modal:!0},render:e=>h(e,i`<ds-button slot="trigger" variant="secondary" size="sm" label="Add member"></ds-button>`,i`
        <ds-form label="Add member" name="add-member">
          <ds-input label="Email" name="email" type="email" required></ds-input>
          <ds-button slot="actions" type="submit" variant="primary" size="sm" label="Save"></ds-button>
        </ds-form>
      `)},B={args:{trigger:`An icon-only Button labelled "Help" with the info Icon`,children:`One sentence of help ending in a Link to the guide`,showArrow:!0,placement:`end`},render:e=>h(e,i`<ds-button slot="trigger" variant="ghost" size="sm" icon-only label="Help">
        <ds-icon slot="leading-icon" name="info"></ds-icon>
      </ds-button>`,i`<ds-text size="sm">Filters apply to every view in this project; <ds-link href="#" label="read the guide"></ds-link>.</ds-text>`)},V=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`PlacementBottomStart`,`PlacementBottom`,`PlacementBottomEnd`,`PlacementTopStart`,`PlacementTop`,`PlacementTopEnd`,`PlacementStart`,`PlacementEnd`,`Modal`,`ShowArrow`,`NotDismissible`,`Uncontrolled`,`Keyboard`,`FilterPanel`,`DatePickerPanel`,`RequiredStep`,`ContextualHelp`],b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...filterPanelArgs,
    open: true
  }
}`,...b.parameters?.docs?.source},description:{story:`Open, with the filter-panel example's args, so the derived scenarios find the named panel.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Filters',
    headingLevel: '2',
    open: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Filters',
    headingLevel: '3',
    open: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Filters',
    headingLevel: '4',
    open: true
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-start',
    open: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom',
    open: true
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-end',
    open: true
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-start',
    open: true
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top',
    open: true
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-end',
    open: true
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start',
    open: true
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end',
    open: true
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Filters',
    modal: true,
    open: true
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    showArrow: true,
    open: true
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false,
    open: true
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Filters'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    ...filterPanelArgs,
    open: true,
    modal: false
  }
}`,...I.parameters?.docs?.source},description:{story:"Open with its trigger and three focusable children, for the keyboard gate:\r\nEscape, Tab past the last element (`args=modal:!false`), Shift+Tab from the first.",...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: filterPanelArgs
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: 'A date field Button with the calendar Icon showing the current date',
    children: 'Three quick-pick date Buttons: Today, Tomorrow, Next week'
  },
  render: args => popover(args, html\`<ds-button slot="trigger" variant="secondary" size="sm" label=\${new Date().toLocaleDateString()}>
        <ds-icon slot="leading-icon" name="calendar"></ds-icon>
      </ds-button>\`, html\`
        <ds-stack gap="tight">
          <ds-button variant="ghost" size="sm" label="Today"></ds-button>
          <ds-button variant="ghost" size="sm" label="Tomorrow"></ds-button>
          <ds-button variant="ghost" size="sm" label="Next week"></ds-button>
        </ds-stack>
      \`)
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: 'An Add member Button',
    children: 'An email Input and a Save Button',
    heading: 'Add member',
    modal: true
  },
  render: args => popover(args, html\`<ds-button slot="trigger" variant="secondary" size="sm" label="Add member"></ds-button>\`, html\`
        <ds-form label="Add member" name="add-member">
          <ds-input label="Email" name="email" type="email" required></ds-input>
          <ds-button slot="actions" type="submit" variant="primary" size="sm" label="Save"></ds-button>
        </ds-form>
      \`)
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: 'An icon-only Button labelled "Help" with the info Icon',
    children: 'One sentence of help ending in a Link to the guide',
    showArrow: true,
    placement: 'end'
  },
  render: args => popover(args, html\`<ds-button slot="trigger" variant="ghost" size="sm" icon-only label="Help">
        <ds-icon slot="leading-icon" name="info"></ds-icon>
      </ds-button>\`, html\`<ds-text size="sm">Filters apply to every view in this project; <ds-link href="#" label="read the guide"></ds-link>.</ds-text>\`)
}`,...B.parameters?.docs?.source}}}})))()}H();export{B as ContextualHelp,R as DatePickerPanel,b as Default,L as FilterPanel,x as HeadingLevel2,S as HeadingLevel3,C as HeadingLevel4,I as Keyboard,M as Modal,P as NotDismissible,T as PlacementBottom,E as PlacementBottomEnd,w as PlacementBottomStart,j as PlacementEnd,A as PlacementStart,O as PlacementTop,k as PlacementTopEnd,D as PlacementTopStart,z as RequiredStep,N as ShowArrow,F as Uncontrolled,V as __namedExportsOrder,y as default};