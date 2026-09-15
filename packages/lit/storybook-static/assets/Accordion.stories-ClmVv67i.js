import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Text-Dgpz9DWN.js";import{j as i}from"./iframe-CsoUKhN4.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),i(),r(),a=[{id:`plans`,summary:`Can I change plans later?`,body:`Upgrades apply immediately; downgrades apply at the next renewal.`},{id:`refunds`,summary:`Do you offer refunds?`,body:`Annual plans can be refunded within 14 days of purchase.`},{id:`cancel`,summary:`What happens if I cancel?`,body:`Your workspace becomes read-only at the end of the billing period.`}],o={title:`Accordion/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`open-change`]}},argTypes:{headingLevel:{control:`select`,options:[`2`,`3`,`4`,`5`,`6`]},exclusive:{control:`boolean`},divided:{control:`boolean`},keepMounted:{control:`boolean`}},args:{headingLevel:`3`,exclusive:!1,divided:!0,keepMounted:!1,defaultValue:void 0},render:e=>n`
    <ds-accordion
      heading-level=${e.headingLevel}
      ?exclusive=${e.exclusive}
      ?divided=${e.divided}
      ?keep-mounted=${e.keepMounted}
      .defaultValue=${e.defaultValue}
    >
      ${a.map(e=>n`
          <ds-disclosure id=${e.id} summary=${e.summary}>
            <ds-text>${e.body}</ds-text>
          </ds-disclosure>
        `)}
    </ds-accordion>
  `},s={},c={args:{headingLevel:`2`}},l={args:{headingLevel:`3`}},u={args:{headingLevel:`4`}},d={args:{headingLevel:`5`}},f={args:{headingLevel:`6`}},p={args:{exclusive:!0,defaultValue:`plans`}},m={args:{divided:!1}},h={args:{keepMounted:!0}},g={args:{defaultValue:[`plans`,`refunds`]}},_=a.map(({id:e,summary:t})=>({id:e,summary:t})),v={render:()=>n`
    <ds-accordion .items=${_}>
      ${a.map(e=>n`<div slot=${e.id}><ds-text>${e.body}</ds-text></div>`)}
    </ds-accordion>
  `},y={render:()=>n`
    <ds-accordion>
      ${a.map(e=>n`
          <ds-disclosure id=${e.id} summary=${e.summary}>
            <ds-text>${e.body}</ds-text>
          </ds-disclosure>
        `)}
    </ds-accordion>
  `},b=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HeadingLevel5`,`HeadingLevel6`,`ExclusiveTrue`,`DividedFalse`,`KeepMountedTrue`,`WithDefaultValue`,`ItemsProp`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
    exclusive: true,
    defaultValue: 'plans'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    divided: false
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    keepMounted: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: ['plans', 'refunds']
  }
}`,...g.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:"{\n  render: () => html`\n    <ds-accordion .items=${ITEMS}>\n      ${FAQ.map(item => html`<div slot=${item.id}><ds-text>${item.body}</ds-text></div>`)}\n    </ds-accordion>\n  `\n}",...v.parameters?.docs?.source},description:{story:"`items` renders the `<ds-disclosure>` elements itself; each entry's panel\r\ncontent is provided as a light-DOM child slotted by the item's `id`.",...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-accordion>
      \${FAQ.map(item => html\`
          <ds-disclosure id=\${item.id} summary=\${item.summary}>
            <ds-text>\${item.body}</ds-text>
          </ds-disclosure>
        \`)}
    </ds-accordion>
  \`
}`,...y.parameters?.docs?.source},description:{story:`Three enabled triggers so the keyboard gate can verify ArrowUp/ArrowDown\r
wrapping and Home/End, with every trigger still a regular Tab stop.`,...y.parameters?.docs?.description}}}})))()}x();export{s as Default,m as DividedFalse,p as ExclusiveTrue,c as HeadingLevel2,l as HeadingLevel3,u as HeadingLevel4,d as HeadingLevel5,f as HeadingLevel6,v as ItemsProp,h as KeepMountedTrue,y as Keyboard,g as WithDefaultValue,b as __namedExportsOrder,o as default};