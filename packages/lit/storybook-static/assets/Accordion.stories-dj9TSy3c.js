import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-b_nq3K9L.js";import{N as i}from"./iframe-C6sywzE2.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{t(),i(),r(),a=[{id:`cancel`,summary:`What happens if I cancel?`,content:`You keep access until the end of the billing period.`},{id:`plans`,summary:`Can I change plans later?`,content:`Yes. Changes take effect at the next billing date.`},{id:`refunds`,summary:`Do you offer refunds?`,content:`Within 14 days of a charge, in full.`}],o={title:`Accordion/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`open-change`]}},argTypes:{headingLevel:{control:`select`,options:[`2`,`3`,`4`,`5`,`6`]},exclusive:{control:`boolean`},divided:{control:`boolean`},keepMounted:{control:`boolean`}},args:{items:a,headingLevel:`3`,exclusive:!1,divided:!0,keepMounted:!1},render:e=>n`
    <ds-accordion
      .items=${e.items.map(({id:e,summary:t,disabled:n})=>({id:e,summary:t,disabled:n}))}
      heading-level=${e.headingLevel}
      ?exclusive=${e.exclusive}
      .divided=${e.divided}
      ?keep-mounted=${e.keepMounted}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
    >
      ${e.items.map(e=>n`<div slot=${e.id}><ds-text>${e.content}</ds-text></div>`)}
    </ds-accordion>
  `},s={},c={args:{headingLevel:`2`}},l={args:{headingLevel:`3`}},u={args:{headingLevel:`4`}},d={args:{headingLevel:`5`}},f={args:{headingLevel:`6`}},p={args:{items:[{id:`cancel`,summary:`What happens if I cancel?`,content:`You keep access until the end of the billing period.`},{id:`refunds`,summary:`Do you offer refunds?`,content:`Within 14 days of a charge, in full.`}]}},m={args:{exclusive:!0,items:[{id:`free`,summary:`Free`,content:`One project and community support.`},{id:`pro`,summary:`Pro`,content:`Unlimited projects and email support.`}]}},h={args:{keepMounted:!0,headingLevel:`2`,items:[{id:`contact`,summary:`Contact details`,content:`Name and email fields.`},{id:`billing`,summary:`Billing address`,content:`Street and city fields.`}]}},g={args:{defaultValue:`setup`,items:[{id:`setup`,summary:`Getting set up`,content:`Install the package and add the provider.`},{id:`upgrade`,summary:`Upgrading`,content:`Read the migration notes before bumping a major.`}]}},_={args:{divided:!1,items:[{id:`shipping`,summary:`Shipping`,content:`Orders ship within two business days.`},{id:`returns`,summary:`Returns`,content:`Items can be returned within 30 days.`}]}},v={args:{value:[`cancel`,`plans`]}},y={args:{items:[...a,{id:`support`,summary:`How do I contact support?`,content:`Write to the support team.`,disabled:!0}]}},b={args:{items:a}},x=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HeadingLevel5`,`HeadingLevel6`,`Faq`,`OneOpenAtATime`,`FormSections`,`InitiallyOpen`,`Undivided`,`Controlled`,`DisabledItem`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '5'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '6'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      id: 'cancel',
      summary: 'What happens if I cancel?',
      content: 'You keep access until the end of the billing period.'
    }, {
      id: 'refunds',
      summary: 'Do you offer refunds?',
      content: 'Within 14 days of a charge, in full.'
    }]
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    exclusive: true,
    items: [{
      id: 'free',
      summary: 'Free',
      content: 'One project and community support.'
    }, {
      id: 'pro',
      summary: 'Pro',
      content: 'Unlimited projects and email support.'
    }]
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    keepMounted: true,
    headingLevel: '2',
    items: [{
      id: 'contact',
      summary: 'Contact details',
      content: 'Name and email fields.'
    }, {
      id: 'billing',
      summary: 'Billing address',
      content: 'Street and city fields.'
    }]
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'setup',
    items: [{
      id: 'setup',
      summary: 'Getting set up',
      content: 'Install the package and add the provider.'
    }, {
      id: 'upgrade',
      summary: 'Upgrading',
      content: 'Read the migration notes before bumping a major.'
    }]
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    divided: false,
    items: [{
      id: 'shipping',
      summary: 'Shipping',
      content: 'Orders ship within two business days.'
    }, {
      id: 'returns',
      summary: 'Returns',
      content: 'Items can be returned within 30 days.'
    }]
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    value: ['cancel', 'plans']
  }
}`,...v.parameters?.docs?.source},description:{story:"Controlled: `value` owns the open set, so a trigger reports `change` and waits for the consumer.",...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    items: [...ITEMS, {
      id: 'support',
      summary: 'How do I contact support?',
      content: 'Write to the support team.',
      disabled: true
    }]
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    items: ITEMS
  }
}`,...b.parameters?.docs?.source},description:{story:`Present with three enabled triggers and nothing open, for the keyboard gate.`,...b.parameters?.docs?.description}}}})))()}S();export{v as Controlled,s as Default,y as DisabledItem,p as Faq,h as FormSections,c as HeadingLevel2,l as HeadingLevel3,u as HeadingLevel4,d as HeadingLevel5,f as HeadingLevel6,g as InitiallyOpen,b as Keyboard,m as OneOpenAtATime,_ as Undivided,x as __namedExportsOrder,o as default};