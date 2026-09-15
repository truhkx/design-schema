import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Button-TSn-G4Vm.js";import{t as i}from"./Text-Dgpz9DWN.js";import{t as a}from"./Link-CFGwxdql.js";import{r as o}from"./iframe-CsoUKhN4.js";function s(e){return new Date(Date.now()-e*6e4).toISOString()}var c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),o(),i(),a(),r(),c={title:`Feed/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`load-more`,`show-new`,`item-visible`]}},argTypes:{headingLevel:{control:`select`,options:[`2`,`3`,`4`]},hasMore:{control:`boolean`},loading:{control:`boolean`},newItemsCount:{control:`number`},endMessage:{control:`text`}},args:{label:`Activity`,headingLevel:`3`,hasMore:!1,loading:!1,newItemsCount:void 0,endMessage:void 0,items:[{id:`evt-3`,heading:`Ana commented on Invoice 42`,timestamp:s(3),content:n`<ds-text size="sm">"Looks good, approving now."</ds-text>`,actions:n`<ds-link href="/invoices/42">View invoice</ds-link>`,unread:!0},{id:`evt-47`,heading:`Priya archived Project Nimbus`,timestamp:s(47),content:n`<ds-text size="sm">Moved to the archive after the Q3 review.</ds-text>`},{id:`evt-95`,heading:`Dae opened a new ticket`,timestamp:s(95),content:n`<ds-text size="sm">"Export is failing for large workspaces."</ds-text>`,actions:n`<ds-link href="/tickets/108">View ticket</ds-link>`}]},render:e=>n`
    <ds-feed
      label=${e.label}
      heading-level=${e.headingLevel}
      ?has-more=${e.hasMore}
      ?loading=${e.loading}
      .newItemsCount=${e.newItemsCount}
      .items=${e.items}
      end-message=${e.endMessage??``}
    ></ds-feed>
  `},l={},u={args:{headingLevel:`2`}},d={args:{headingLevel:`3`}},f={args:{headingLevel:`4`}},p={args:{hasMore:!0}},m={args:{hasMore:!0,loading:!0}},h={args:{newItemsCount:4}},g={args:{endMessage:`No more activity today.`}},_={args:{items:[]}},v={args:{items:[],loading:!0}},y={args:{newItemsCount:2}},b=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HasMoreTrue`,`LoadingTrue`,`NewItemsCount`,`CustomEndMessage`,`Empty`,`EmptyLoading`,`Keyboard`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    hasMore: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    hasMore: true,
    loading: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    newItemsCount: 4
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    endMessage: 'No more activity today.'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    items: []
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    items: [],
    loading: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    newItemsCount: 2
  }
}`,...y.parameters?.docs?.source},description:{story:`Three articles, each with a focusable action, so Tab moves through each\r
article's interactive content and PageUp/PageDown/Ctrl+Home/Ctrl+End move\r
between and out of articles.`,...y.parameters?.docs?.description}}}})))()}x();export{g as CustomEndMessage,l as Default,_ as Empty,v as EmptyLoading,p as HasMoreTrue,u as HeadingLevel2,d as HeadingLevel3,f as HeadingLevel4,y as Keyboard,m as LoadingTrue,h as NewItemsCount,b as __namedExportsOrder,c as default};