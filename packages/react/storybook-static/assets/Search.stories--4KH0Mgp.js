import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-D5pPePpr.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Search-D_cvTXw9.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{a=t(),r(),o=n(),s=[{value:`invoices-march`,label:`Invoices from March`},{value:`invoices-april`,label:`Invoices from April`},{value:`invoices-overdue`,label:`Overdue invoices`,description:`Past their due date`}],c={title:`Search/React`,component:i,args:{label:`Search products`},tags:[`autodocs`]},l={},u={args:{size:`md`}},d={args:{size:`lg`}},f={args:{label:`Search this site`,placeholder:`Search products and orders`}},p={args:{label:`Search orders`,showLabel:!0,size:`lg`}},m={args:{label:`Search products`,suggestions:[{value:`invoices-march`,label:`Invoices from March`},{value:`invoices-april`,label:`Invoices from April`}]}},h={args:{label:`Filter results`,landmark:!1,name:`filter`}},g={args:{defaultValue:`invoices`}},_={args:{disabled:!0,defaultValue:`invoices`}},v={args:{defaultValue:`invoices`,suggestions:[],loading:!0}},y={args:{defaultValue:`zzz`,suggestions:[]}},b={render:e=>{function t(){let[t,n]=(0,a.useState)(void 0);return(0,o.jsx)(i,{...e,onChange:e=>{let t=e.trim().toLowerCase();n(t?s.filter(e=>e.label.toLowerCase().includes(t)):void 0)}})}return(0,o.jsx)(t,{})}},x={args:{landmark:!1}},S={args:{defaultValue:`invoices`,suggestions:[{value:`invoices-march`,label:`Invoices from March`},{value:`invoices-april`,label:`Invoices from April`}]}},C=[`Default`,`SizeMd`,`SizeLg`,`HeaderSearch`,`SearchPageHero`,`WithSuggestions`,`FilterWithinAResultsPage`,`WithValue`,`Disabled`,`Loading`,`NoSuggestions`,`SuggestionsFromOnChange`,`LandmarkOff`,`Keyboard`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Search this site',
    placeholder: 'Search products and orders'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Search orders',
    showLabel: true,
    size: 'lg'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Filter results',
    landmark: false,
    name: 'filter'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'invoices'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'invoices'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'invoices',
    suggestions: [],
    loading: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'zzz',
    suggestions: []
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Demo() {
      const [suggestions, setSuggestions] = useState<SearchSuggestion[] | undefined>(undefined);
      return <Search {...args} onChange={query => {
        const needle = query.trim().toLowerCase();
        setSuggestions(needle ? SUGGESTIONS.filter(s => s.label.toLowerCase().includes(needle)) : undefined);
      }} />;
    }
    return <Demo />;
  }
}`,...b.parameters?.docs?.source},description:{story:"Suggestions supplied from `onChange`, the way a caller wires a fetch.",...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    landmark: false
  }
}`,...x.parameters?.docs?.source},description:{story:"Inside a search landmark of its own, with `landmark` off: a plain form.",...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'invoices',
    suggestions: [{
      value: 'invoices-march',
      label: 'Invoices from March'
    }, {
      value: 'invoices-april',
      label: 'Invoices from April'
    }]
  }
}`,...S.parameters?.docs?.source},description:{story:"For the keyboard gate: the closed field with a query and the `with-suggestions` example's\r\nsuggestions, so the input, the clear button (there is text) and the submit button are the three\r\nfocus stops the Tab rule walks, and the first ArrowDown opens the list. There is no `open` prop —\r\nfocus alone never opens it.",...S.parameters?.docs?.description}}}})))()}w();export{l as Default,_ as Disabled,h as FilterWithinAResultsPage,f as HeaderSearch,S as Keyboard,x as LandmarkOff,v as Loading,y as NoSuggestions,p as SearchPageHero,d as SizeLg,u as SizeMd,b as SuggestionsFromOnChange,m as WithSuggestions,g as WithValue,C as __namedExportsOrder,c as default};