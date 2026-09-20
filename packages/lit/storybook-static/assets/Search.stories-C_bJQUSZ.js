import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{d as a}from"./iframe-B0T1LYjz.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),r(),a(),o=[{value:`invoices-march`,label:`Invoices from March`},{value:`invoices-april`,label:`Invoices from April`},{value:`invoice-templates`,label:`Invoice templates`}],s={title:`Search/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`submit`,`clear`]}},argTypes:{size:{control:`select`,options:[`md`,`lg`]},showLabel:{control:`boolean`},loading:{control:`boolean`},landmark:{control:`boolean`},disabled:{control:`boolean`}},args:{label:`Search products`},render:e=>i`
    <ds-search
      label=${e.label}
      ?show-label=${e.showLabel===!0}
      name=${n(e.name)}
      .value=${e.value}
      default-value=${n(e.defaultValue)}
      placeholder=${n(e.placeholder)}
      action=${n(e.action)}
      .suggestions=${e.suggestions}
      ?loading=${e.loading===!0}
      ?no-landmark=${e.landmark===!1}
      size=${n(e.size)}
      ?disabled=${e.disabled===!0}
    ></ds-search>
  `},c={},l={args:{size:`md`}},u={args:{size:`lg`}},d={args:{showLabel:!0}},f={args:{disabled:!0,defaultValue:`invoices`}},p={args:{defaultValue:`inv`,suggestions:[],loading:!0}},m={args:{defaultValue:`zzz`,suggestions:[]}},h={args:{label:`Search this site`,placeholder:`Search products and orders`}},g={args:{label:`Search orders`,showLabel:!0,size:`lg`}},_={args:{label:`Search products`,suggestions:[{value:`invoices-march`,label:`Invoices from March`},{value:`invoices-april`,label:`Invoices from April`}]}},v={args:{label:`Filter results`,landmark:!1,name:`filter`}},y={args:{defaultValue:`invoices`,suggestions:o},play:async({canvasElement:e})=>{let t=e.querySelector(`ds-search`);await t?.updateComplete;let n=t?.shadowRoot?.querySelector(`[data-part=input]`);n?.focus(),n?.dispatchEvent(new KeyboardEvent(`keydown`,{key:`ArrowDown`,bubbles:!0,composed:!0}))}},b=[`Default`,`SizeMd`,`SizeLg`,`ShowLabel`,`Disabled`,`Loading`,`NoSuggestions`,`HeaderSearch`,`SearchPageHero`,`WithSuggestions`,`FilterWithinAResultsPage`,`Keyboard`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
    disabled: true,
    defaultValue: 'invoices'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'inv',
    suggestions: [],
    loading: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'zzz',
    suggestions: []
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Search this site',
    placeholder: 'Search products and orders'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Search orders',
    showLabel: true,
    size: 'lg'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Search products',
    suggestions: [{
      value: 'invoices-march',
      label: 'Invoices from March'
    }, {
      value: 'invoices-april',
      label: 'Invoices from April'
    }]
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Filter results',
    landmark: false,
    name: 'filter'
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
    await search?.updateComplete;
    const input = search?.shadowRoot?.querySelector<HTMLInputElement>('[data-part=input]');
    input?.focus();
    input?.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      composed: true
    }));
  }
}`,...y.parameters?.docs?.source},description:{story:"Open with its suggestions, and three focusable children in the field\r\n(input, clear button, submit button). Search has no `open` prop, so `play`\r\nfocuses the input and presses ArrowDown, which opens the list.",...y.parameters?.docs?.description}}}})))()}x();export{c as Default,f as Disabled,v as FilterWithinAResultsPage,h as HeaderSearch,y as Keyboard,p as Loading,m as NoSuggestions,g as SearchPageHero,d as ShowLabel,u as SizeLg,l as SizeMd,_ as WithSuggestions,b as __namedExportsOrder,s as default};