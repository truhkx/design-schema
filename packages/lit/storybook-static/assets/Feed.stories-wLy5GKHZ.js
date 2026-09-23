import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-b_nq3K9L.js";import{t as i}from"./Button-B3rVveNU.js";import{t as a}from"./Link-CzFgI_Cj.js";import{r as o}from"./iframe-C6sywzE2.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),o(),i(),a(),r(),s={title:`Feed/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`load-more`,`show-new`,`item-visible`]}},argTypes:{headingLevel:{control:`inline-radio`,options:[`2`,`3`,`4`]},hasMore:{control:`boolean`},loading:{control:`boolean`},newItemsCount:{control:`number`},endMessage:{control:`text`}},args:{label:`Activity`,items:[{id:`a1`,heading:`Ana commented on Invoice 42`,timestamp:`2026-09-15T09:00:00Z`,content:n`<ds-text>Looks right to me.</ds-text>`,actions:n`<ds-button label="Reply" variant="secondary" size="sm"></ds-button>`,unread:!0},{id:`a2`,heading:`Bo approved Invoice 41`,timestamp:`2026-09-14T16:20:00Z`,content:n`<ds-link href="#invoice-41" label="Open Invoice 41"></ds-link>`},{id:`a3`,heading:`Cy exported the March report`,timestamp:`2026-09-10T12:00:00Z`,content:n`<ds-text>The export is ready to download.</ds-text>`,actions:n`<ds-button label="Download" variant="secondary" size="sm"></ds-button>`}],hasMore:!1,loading:!1,headingLevel:`3`,newItemsCount:void 0,endMessage:void 0},render:e=>n`
    <ds-feed
      label=${e.label}
      heading-level=${e.headingLevel}
      ?has-more=${e.hasMore}
      ?loading=${e.loading}
      .newItemsCount=${e.newItemsCount}
      .endMessage=${e.endMessage}
      .items=${e.items}
    ></ds-feed>
  `},c={},l={args:{headingLevel:`2`}},u={args:{headingLevel:`3`}},d={args:{headingLevel:`4`}},f={args:{hasMore:!0}},p={args:{hasMore:!0,loading:!0}},m={args:{newItemsCount:4}},h={args:{items:[],hasMore:!1}},g={args:{items:[],hasMore:!0,loading:!0}},_={args:{label:`Activity`,hasMore:!0,items:[{id:`a1`,heading:`Ana commented on Invoice 42`,timestamp:`2026-09-15T09:00:00Z`,content:`Looks right to me.`},{id:`a2`,heading:`Bo approved Invoice 41`,timestamp:`2026-09-14T16:20:00Z`,content:`Approved for payment.`}]}},v={args:{label:`Notifications`,newItemsCount:3,items:[{id:`n1`,heading:`Your export is ready`,timestamp:`2026-09-15T08:00:00Z`,content:`The March export finished.`,unread:!0},{id:`n2`,heading:`Invoice 42 was paid`,timestamp:`2026-09-14T11:00:00Z`,content:`Payment received.`}]}},y={args:{label:`Activity`,hasMore:!1,endMessage:`That is everything from this week.`,items:[{id:`a1`,heading:`Bo approved Invoice 41`,timestamp:`2026-09-14T16:20:00Z`,content:`Approved for payment.`}]}},b={args:{label:`Audit events`,hasMore:!0,loading:!0,headingLevel:`2`,items:[{id:`e1`,heading:`Role changed for Ana`,timestamp:`2026-09-15T07:00:00Z`,content:`Editor to Admin.`}]}},x={},S=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HasMore`,`Loading`,`NewItems`,`Empty`,`EmptyLoading`,`ActivityStream`,`NotificationsWithUnreadItems`,`CaughtUp`,`LoadingTheNextPage`,`Keyboard`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    hasMore: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    hasMore: true,
    loading: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    newItemsCount: 4
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    items: [],
    hasMore: false
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    items: [],
    hasMore: true,
    loading: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Activity',
    hasMore: true,
    items: [{
      id: 'a1',
      heading: 'Ana commented on Invoice 42',
      timestamp: '2026-09-15T09:00:00Z',
      content: 'Looks right to me.'
    }, {
      id: 'a2',
      heading: 'Bo approved Invoice 41',
      timestamp: '2026-09-14T16:20:00Z',
      content: 'Approved for payment.'
    }]
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notifications',
    newItemsCount: 3,
    items: [{
      id: 'n1',
      heading: 'Your export is ready',
      timestamp: '2026-09-15T08:00:00Z',
      content: 'The March export finished.',
      unread: true
    }, {
      id: 'n2',
      heading: 'Invoice 42 was paid',
      timestamp: '2026-09-14T11:00:00Z',
      content: 'Payment received.'
    }]
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Activity',
    hasMore: false,
    endMessage: 'That is everything from this week.',
    items: [{
      id: 'a1',
      heading: 'Bo approved Invoice 41',
      timestamp: '2026-09-14T16:20:00Z',
      content: 'Approved for payment.'
    }]
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Audit events',
    hasMore: true,
    loading: true,
    headingLevel: '2',
    items: [{
      id: 'e1',
      heading: 'Role changed for Ana',
      timestamp: '2026-09-15T07:00:00Z',
      content: 'Editor to Admin.'
    }]
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{}`,...x.parameters?.docs?.source},description:{story:`Present with three focusable children inside the feed's own articles (a Reply button, a Link and a\r
Download button). The new-items row is a sibling of the \`role="feed"\` element rather than one of\r
its children, so its button is deliberately absent here: it would be the first Tab stop on the\r
page while sitting outside the feed the keyboard gate walks.`,...x.parameters?.docs?.description}}}})))()}C();export{_ as ActivityStream,y as CaughtUp,c as Default,h as Empty,g as EmptyLoading,f as HasMore,l as HeadingLevel2,u as HeadingLevel3,d as HeadingLevel4,x as Keyboard,p as Loading,b as LoadingTheNextPage,m as NewItems,v as NotificationsWithUnreadItems,S as __namedExportsOrder,s as default};