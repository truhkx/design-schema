import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{d as a}from"./iframe-CsoUKhN4.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),i(),a(),o=[{value:`invoices-march`,label:`Invoices from March`},{value:`invoices-april`,label:`Invoices from April`,description:`12 results`},{value:`invoice-templates`,label:`Invoice templates`}],s={title:`Search/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`submit`,`clear`]}},argTypes:{size:{control:`select`,options:[`md`,`lg`]},showLabel:{control:`boolean`},loading:{control:`boolean`},landmark:{control:`boolean`},disabled:{control:`boolean`}},args:{label:`Search products`,showLabel:!1,name:`q`,value:void 0,defaultValue:void 0,placeholder:void 0,action:void 0,suggestions:void 0,loading:!1,landmark:!0,size:`md`,disabled:!1},render:e=>n`
    <ds-search
      label=${e.label}
      ?show-label=${e.showLabel}
      name=${e.name}
      .value=${e.value}
      default-value=${r(e.defaultValue)}
      placeholder=${r(e.placeholder)}
      action=${r(e.action)}
      .suggestions=${e.suggestions}
      ?loading=${e.loading}
      ?no-landmark=${!e.landmark}
      size=${e.size}
      ?disabled=${e.disabled}
    ></ds-search>
  `},c={},l={args:{size:`md`}},u={args:{size:`lg`}},d={args:{showLabel:!0}},f={args:{landmark:!1,label:`Filter these results`}},p={args:{disabled:!0,defaultValue:`invoices`}},m={args:{placeholder:`Try "invoices from March"`}},h={args:{action:`/search`,defaultValue:`invoices`}},g={args:{defaultValue:`invoices`,suggestions:o}},_={args:{defaultValue:`inv`,suggestions:[],loading:!0}},v={args:{defaultValue:`zzz`,suggestions:[]}},y={args:{defaultValue:`invoices`,suggestions:o},play:async({canvasElement:e})=>{let t=e.querySelector(`ds-search`)?.shadowRoot?.querySelector(`#input`);t?.focus(),t?.dispatchEvent(new KeyboardEvent(`keydown`,{key:`ArrowDown`,bubbles:!0,composed:!0}))}},b=[`Default`,`SizeMd`,`SizeLg`,`ShowLabelTrue`,`LandmarkFalse`,`DisabledTrue`,`WithPlaceholder`,`WithAction`,`WithSuggestions`,`LoadingTrue`,`NoSuggestions`,`Keyboard`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    landmark: false,
    label: 'Filter these results'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'invoices'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Try "invoices from March"'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    action: '/search',
    defaultValue: 'invoices'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'invoices',
    suggestions: SUGGESTIONS
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'inv',
    suggestions: [],
    loading: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'zzz',
    suggestions: []
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'invoices',
    suggestions: SUGGESTIONS
  },
  play: async ({
    canvasElement
  }) => {
    const search = canvasElement.querySelector('ds-search');
    const input = search?.shadowRoot?.querySelector<HTMLInputElement>('#input');
    input?.focus();
    input?.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      composed: true
    }));
  }
}`,...y.parameters?.docs?.source},description:{story:`Renders open with its field and at least three focusable children (input,\r
clear button, submit button) so the keyboard gate can verify\r
ArrowDown-to-open, arrow navigation, Enter to commit, Escape and Tab.\r
Real DOM focus stays on the input the whole time — the popup opens via\r
\`play\` dispatching ArrowDown on the input, since (unlike Menu/Popover/\r
Dialog) this component's schema has no controlled \`open\` prop to set\r
declaratively.`,...y.parameters?.docs?.description}}}})))()}x();export{c as Default,p as DisabledTrue,y as Keyboard,f as LandmarkFalse,_ as LoadingTrue,v as NoSuggestions,d as ShowLabelTrue,u as SizeLg,l as SizeMd,h as WithAction,m as WithPlaceholder,g as WithSuggestions,b as __namedExportsOrder,s as default};