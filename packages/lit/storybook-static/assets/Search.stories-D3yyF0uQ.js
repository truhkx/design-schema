import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{d as a}from"./iframe-Dy0IL05G.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{t(),r(),a(),o=[{value:`invoices-march`,label:`Invoices from March`},{value:`invoices-april`,label:`Invoices from April`},{value:`invoices-overdue`,label:`Overdue invoices`,description:`Past their due date`}],s={title:`Search/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`submit`,`clear`]}},argTypes:{size:{control:`select`,options:[`md`,`lg`]},showLabel:{control:`boolean`},loading:{control:`boolean`},landmark:{control:`boolean`},disabled:{control:`boolean`}},args:{label:`Search products`},render:e=>i`
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
  `},c={},l={args:{size:`md`}},u={args:{size:`lg`}},d={args:{label:`Search this site`,placeholder:`Search products and orders`}},f={args:{label:`Search orders`,showLabel:!0,size:`lg`}},p={args:{label:`Search products`,suggestions:[{value:`invoices-march`,label:`Invoices from March`},{value:`invoices-april`,label:`Invoices from April`}]}},m={args:{label:`Filter results`,landmark:!1,name:`filter`}},h={args:{defaultValue:`invoices`}},g={args:{disabled:!0,defaultValue:`invoices`}},_={args:{defaultValue:`invoices`,suggestions:[],loading:!0}},v={args:{defaultValue:`zzz`,suggestions:[]}},y={render:e=>i`
    <ds-search
      label=${e.label}
      ?show-label=${e.showLabel===!0}
      name=${n(e.name)}
      default-value=${n(e.defaultValue)}
      placeholder=${n(e.placeholder)}
      ?no-landmark=${e.landmark===!1}
      size=${n(e.size)}
      @change=${e=>{let t=e.currentTarget,n=e.detail.value.trim().toLowerCase();t.suggestions=n?o.filter(e=>e.label.toLowerCase().includes(n)):void 0}}
    ></ds-search>
  `},b={args:{defaultValue:`invoices`,suggestions:o}},x=[`Default`,`SizeMd`,`SizeLg`,`HeaderSearch`,`SearchPageHero`,`WithSuggestions`,`FilterWithinAResultsPage`,`WithValue`,`Disabled`,`Loading`,`NoSuggestions`,`SuggestionsFromOnChange`,`Keyboard`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Search this site',
    placeholder: 'Search products and orders'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Search orders',
    showLabel: true,
    size: 'lg'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Filter results',
    landmark: false,
    name: 'filter'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'invoices'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'invoices'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'invoices',
    suggestions: [],
    loading: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'zzz',
    suggestions: []
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-search
      label=\${args.label}
      ?show-label=\${args.showLabel === true}
      name=\${ifDefined(args.name)}
      default-value=\${ifDefined(args.defaultValue)}
      placeholder=\${ifDefined(args.placeholder)}
      ?no-landmark=\${args.landmark === false}
      size=\${ifDefined(args.size)}
      @change=\${(event: CustomEvent<SearchChangeDetail>) => {
    const search = event.currentTarget as DsSearch;
    const needle = event.detail.value.trim().toLowerCase();
    search.suggestions = needle ? SUGGESTIONS.filter(item => item.label.toLowerCase().includes(needle)) : undefined;
  }}
    ></ds-search>
  \`
}`,...y.parameters?.docs?.source},description:{story:"Suggestions supplied from `change`, the way a caller wires a fetch.",...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'invoices',
    suggestions: SUGGESTIONS
  }
}`,...b.parameters?.docs?.source},description:{story:`For the keyboard gate: the closed field with a query and suggestions, so the\r
input, the clear button (there is text) and the submit button are the three\r
focus stops the Tab rule walks, and the first ArrowDown opens the list. There\r
is no \`open\` prop — focus alone never opens it.`,...b.parameters?.docs?.description}}}})))()}S();export{c as Default,g as Disabled,m as FilterWithinAResultsPage,d as HeaderSearch,b as Keyboard,_ as Loading,v as NoSuggestions,f as SearchPageHero,u as SizeLg,l as SizeMd,y as SuggestionsFromOnChange,p as WithSuggestions,h as WithValue,x as __namedExportsOrder,s as default};