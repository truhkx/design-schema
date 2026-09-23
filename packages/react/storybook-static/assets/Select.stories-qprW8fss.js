import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-D5pPePpr.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Select--B9VQw0y.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{a=t(),r(),o=n(),s=[{value:`ca`,label:`Canada`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`jp`,label:`Japan`},{value:`mx`,label:`Mexico`},{value:`us`,label:`United States`}],c=[{group:`Engineering`,options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`}]},{group:`Design`,options:[{value:`product`,label:`Product design`},{value:`brand`,label:`Brand design`}]}],l={title:`Select/React`,component:i,args:{label:`Country`,name:`country`,options:s},tags:[`autodocs`]},u={},d={args:{size:`sm`}},f={args:{size:`md`}},p={args:{native:`auto`}},m={args:{native:`always`}},h={args:{native:`never`}},g={args:{label:`Country`,name:`country`,placeholder:`Choose a country`,options:[{value:`ca`,label:`Canada`},{value:`fr`,label:`France`},{value:`jp`,label:`Japan`}]}},_={args:{label:`Roles`,name:`roles`,multiple:!0,options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`},{value:`design`,label:`Design`}]}},v={args:{label:`Country`,name:`country`,native:`always`,options:[{value:`ca`,label:`Canada`},{value:`us`,label:`United States`}]}},y={args:{label:`Month`,name:`month`,hideLabel:!0,size:`sm`,options:[{value:`1`,label:`January`},{value:`2`,label:`February`}]}},b={args:{label:`Role`,name:`role`,options:c,multiple:!0,defaultValue:[`frontend`,`backend`,`brand`]}},x={args:{description:`Used for shipping and tax rates.`}},S={args:{required:!0}},C={args:{disabled:!0,defaultValue:`fr`}},w={args:{invalid:!0}},T={args:{error:`Choose the country you ship to.`}},E={args:{defaultValue:`fr`}},D={args:{disabled:!0,open:!0}},O={args:{open:!0},render:function(e){let[t,n]=(0,a.useState)(e.open??!0),r=(0,a.useRef)(null);return(0,a.useEffect)(()=>{r.current?.focus()},[]),(0,o.jsx)(i,{...e,ref:r,open:t,onOpenChange:t=>{n(t),e.onOpenChange?.(t)}})}},k=[`Default`,`SizeSm`,`SizeMd`,`NativeAuto`,`NativeAlways`,`NativeNever`,`CountryPicker`,`MultiSelectRoles`,`ForcedNativePicker`,`CompactPickerInAHeader`,`Multiple`,`WithDescription`,`Required`,`Disabled`,`Invalid`,`WithError`,`DefaultValue`,`DisabledOpen`,`Keyboard`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'auto'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'always'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'never'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Country',
    name: 'country',
    placeholder: 'Choose a country',
    options: [{
      value: 'ca',
      label: 'Canada'
    }, {
      value: 'fr',
      label: 'France'
    }, {
      value: 'jp',
      label: 'Japan'
    }]
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Roles',
    name: 'roles',
    multiple: true,
    options: [{
      value: 'frontend',
      label: 'Frontend'
    }, {
      value: 'backend',
      label: 'Backend'
    }, {
      value: 'design',
      label: 'Design'
    }]
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Country',
    name: 'country',
    native: 'always',
    options: [{
      value: 'ca',
      label: 'Canada'
    }, {
      value: 'us',
      label: 'United States'
    }]
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Month',
    name: 'month',
    hideLabel: true,
    size: 'sm',
    options: [{
      value: '1',
      label: 'January'
    }, {
      value: '2',
      label: 'February'
    }]
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Role',
    name: 'role',
    options: ROLES,
    multiple: true,
    defaultValue: ['frontend', 'backend', 'brand']
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Used for shipping and tax rates.'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'fr'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Choose the country you ship to.'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'fr'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    open: true
  }
}`,...D.parameters?.docs?.source},description:{story:'Disabled wins over a controlled `open`: no popup, aria-expanded="false".',...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  render: function KeyboardStory(args) {
    const [open, setOpen] = useState(args.open ?? true);
    const triggerRef = useRef<HTMLButtonElement | HTMLSelectElement | null>(null);
    useEffect(() => {
      triggerRef.current?.focus();
    }, []);
    return <Select {...args} ref={triggerRef} open={open} onOpenChange={next => {
      setOpen(next);
      args.onOpenChange?.(next);
    }} />;
  }
}`,...O.parameters?.docs?.source},description:{story:`Open with its trigger, for the keyboard gate: the popup's Listbox holds the six country options\r
(focusable children through aria-activedescendant) while focus stays on the trigger. Args come\r
from the story URL; the story owns \`open\` so Escape and Tab really close it, and focuses the\r
trigger before any key is sent, since focus never leaves it.`,...O.parameters?.docs?.description}}}})))()}A();export{y as CompactPickerInAHeader,g as CountryPicker,u as Default,E as DefaultValue,C as Disabled,D as DisabledOpen,v as ForcedNativePicker,w as Invalid,O as Keyboard,_ as MultiSelectRoles,b as Multiple,m as NativeAlways,p as NativeAuto,h as NativeNever,S as Required,f as SizeMd,d as SizeSm,x as WithDescription,T as WithError,k as __namedExportsOrder,l as default};