import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-CeSprNHO.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,t as o}from"./Button-Dwx7L93c.js";import{n as s,t as c}from"./Text-BmznDQS2.js";import{n as l,t as u}from"./Link-crBuztkb.js";import{n as d,t as f}from"./Stack-B9YpxgCt.js";import{n as p,t as m}from"./Card-DL9URS5o.js";import{n as h,t as g}from"./ProgressBar-D1XMqO1v.js";function _(e){if(!e)return{rootStyle:void 0,card:void 0,articleBody:void 0,timestamp:void 0,endMessage:void 0,emptyState:void 0,newItemsButton:void 0};let t={},n={},r={},a={},o={},s={},c={};for(let l of Object.keys(e)){let u=e[l];if(!u)continue;let d=T[l];switch(d&&(t[d]=i(u)),l){case`articleInset`:n.paddingBlock=u,n.paddingInline=u;break;case`articleBodyGap`:r.gap=u;break;case`timestampSize`:a.fontSize=u;break;case`endMessageSize`:o.fontSize=u;break;case`emptyStateSize`:s.fontSize=u;break;case`fontFamily`:a.fontFamily=u,o.fontFamily=u,s.fontFamily=u,c.fontFamily=u}}return{rootStyle:t,card:n,articleBody:r,timestamp:a,endMessage:o,emptyState:s,newItemsButton:c}}function v(e,t){let n=new Date(e).getTime();if(Number.isNaN(n))return e;let r=Math.max(0,t-n);return r<O?w.justNow:r<k?w.minutesAgo.replace(`{n}`,String(Math.floor(r/O))):r<A?w.hoursAgo.replace(`{n}`,String(Math.floor(r/k))):r<j*A?w.daysAgo.replace(`{n}`,String(Math.floor(r/A))):new Intl.DateTimeFormat(void 0,{dateStyle:`medium`}).format(n)}function y(e){let t=new Date(e).getTime();if(!Number.isNaN(t))return new Intl.DateTimeFormat(void 0,{dateStyle:`medium`,timeStyle:`short`}).format(t)}function b(e){return Array.from(e.ownerDocument.querySelectorAll(N)).filter(t=>!e.contains(t)&&!t.closest(`[inert]`))}function x(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}var S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{S=t(),r(),a(),p(),h(),d(),s(),C=n(),w={showNew:`Show {count} new`,loading:`Loading more`,end:`You are all caught up.`,unread:`unread`,position:`{index} of {total}`,empty:`Nothing here yet.`,justNow:`just now`,minutesAgo:`{n} min ago`,hoursAgo:`{n} hr ago`,daysAgo:`{n} d ago`},T={itemGap:`--ds-feed-item-gap`,newItemsOffset:`--ds-feed-new-items-offset`,newItemsLayer:`--ds-feed-new-items-layer`,loadingInset:`--ds-feed-loading-inset`,endMessageInset:`--ds-feed-end-message-inset`,emptyStateInset:`--ds-feed-empty-state-inset`,fontFamily:`--ds-feed-font-family`},E=typeof process<`u`&&!1,D=1e3,O=60*D,k=60*O,A=24*k,j=7,M=D,N=`a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]`,P=function({ref:e,label:t,items:n,hasMore:r=!1,loading:i=!1,newItemsCount:a,headingLevel:s=`3`,endMessage:l,onLoadMore:u,onShowNew:d,onItemVisible:p,overrides:h,onKeyDown:T,...D}){let O=`ds-feed${(0,S.useId)()}`,k=(0,S.useRef)(null);(0,S.useImperativeHandle)(e,()=>k.current,[]);let A=(0,S.useRef)(new Map),j=(0,S.useRef)(null),N=(0,S.useRef)(!1),P=E&&t.trim()===``;(0,S.useEffect)(()=>{P&&!N.current&&(N.current=!0,console.warn("Feed: `label` is the accessible name of the feed and must not be empty."))},[P]);let F=(0,S.useRef)(u),I=(0,S.useRef)(p);(0,S.useEffect)(()=>{F.current=u,I.current=p});let L=n.length,R=n[0]?.id,z=n[L-1]?.id,B=n.map(e=>e.id).join(`\0`),V=a!==void 0&&a>0,H=(0,S.useRef)(!1),U=(0,S.useRef)(R);(0,S.useEffect)(()=>{if(H.current&&R!==void 0&&R!==U.current){H.current=!1;let e=A.current.get(R);e&&(e.focus({preventScroll:!0}),typeof e.scrollIntoView==`function`&&e.scrollIntoView({behavior:x()?`auto`:`smooth`,block:`start`}))}U.current=R},[R]);let W=(0,S.useRef)(!1);(0,S.useEffect)(()=>{L>0?W.current=!1:r&&!i&&!W.current&&(W.current=!0,F.current?.())},[L,r,i]),(0,S.useEffect)(()=>{if(!r||i||z===void 0||typeof IntersectionObserver>`u`)return;let e=A.current.get(z);if(!e)return;let t=!1,n=new IntersectionObserver(e=>{!t&&e.some(e=>e.isIntersecting)&&(t=!0,F.current?.())},{rootMargin:`100% 0px`});return n.observe(e),()=>n.disconnect()},[z,r,i]);let G=(0,S.useRef)(new Set);(0,S.useEffect)(()=>{if(typeof IntersectionObserver>`u`)return;let e=new Map,t=new Map;A.current.forEach((e,n)=>{G.current.has(n)||t.set(e,n)});let n=new IntersectionObserver(r=>{for(let i of r){let r=t.get(i.target);if(r===void 0)continue;let a=e.get(r);if(i.isIntersecting&&i.intersectionRatio>=.5){if(a!==void 0)continue;e.set(r,setTimeout(()=>{e.delete(r),!G.current.has(r)&&(G.current.add(r),n.unobserve(i.target),I.current?.(r))},M))}else a!==void 0&&(clearTimeout(a),e.delete(r))}},{threshold:.5});return t.forEach((e,t)=>n.observe(t)),()=>{n.disconnect(),e.forEach(e=>clearTimeout(e))}},[B]);let K=()=>{H.current=!0,d?.()},q=e=>{T?.(e);let t=k.current;if(e.defaultPrevented||!t)return;let n=e.target.closest(`[role="article"]`);if(n&&n.closest(`[role="feed"]`)===t){if((e.key===`PageDown`||e.key===`PageUp`)&&!e.ctrlKey&&!e.altKey&&!e.metaKey){let r=Array.from(t.querySelectorAll(`[role="article"]`)).filter(e=>e.closest(`[role="feed"]`)===t),i=r.indexOf(n);e.preventDefault(),r[i+(e.key===`PageDown`?1:-1)]?.focus();return}if(e.key===`End`&&e.ctrlKey){e.preventDefault(),r?i||F.current?.():b(t).find(e=>(t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING)!==0)?.focus();return}e.key===`Home`&&e.ctrlKey&&(e.preventDefault(),V&&j.current?j.current.focus():b(t).filter(e=>(t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_PRECEDING)!==0).pop()?.focus())}},J=_(h),Y=Date.now(),X=!r,Z=null;return i?Z=(0,C.jsx)(`div`,{className:`ds-feed__loading`,"data-part":`loadingIndicator`,children:(0,C.jsx)(g,{label:w.loading,hideLabel:!0})}):!r&&L>0&&(Z=(0,C.jsx)(`div`,{className:`ds-feed__end-message`,"data-part":`endMessage`,children:(0,C.jsx)(c,{tone:`muted`,size:`sm`,overrides:J.endMessage,children:l??w.end})})),(0,C.jsxs)(`div`,{...D,ref:k,"data-ds":`Feed`,"data-part":`container`,className:`ds-feed`,style:J.rootStyle,role:`feed`,"aria-label":t,"aria-busy":i,onKeyDown:q,children:[(0,C.jsx)(`div`,{className:V?`ds-feed__new-items ds-feed__new-items--shown`:`ds-feed__new-items`,"data-part":V?`newItemsButton`:void 0,role:`status`,children:V?(0,C.jsx)(o,{ref:j,variant:`secondary`,size:`sm`,label:w.showNew.replace(`{count}`,String(a)),overrides:J.newItemsButton,onClick:K}):null}),(0,C.jsxs)(`div`,{className:`ds-feed__items`,children:[n.map((e,t)=>{let n=`${O}-${t}-time`,r=y(e.timestamp);return(0,C.jsx)(`div`,{className:e.unread?`ds-feed__item ds-feed__item--unread`:`ds-feed__item`,"data-part":`article`,children:(0,C.jsx)(m,{ref:t=>{t?A.current.set(e.id,t):A.current.delete(e.id)},focusable:!0,heading:e.heading,headingLevel:s,inset:`md`,overrides:J.card,role:`article`,"aria-describedby":n,"aria-posinset":t+1,"aria-setsize":X?L:-1,footer:e.actions!==void 0&&e.actions!==null?(0,C.jsx)(`div`,{className:`ds-feed__part`,"data-part":`articleActions`,children:(0,C.jsx)(f,{direction:`horizontal`,gap:`tight`,children:e.actions})}):void 0,children:(0,C.jsx)(`div`,{className:`ds-feed__part`,"data-part":`articleBody`,children:(0,C.jsxs)(f,{gap:`tight`,overrides:J.articleBody,children:[e.unread?(0,C.jsx)(`span`,{className:`ds-feed__visually-hidden`,children:w.unread}):null,(0,C.jsx)(c,{element:`span`,tone:`muted`,size:`xs`,overrides:J.timestamp,children:(0,C.jsx)(`time`,{id:n,"data-part":`timestamp`,dateTime:e.timestamp,title:r,children:v(e.timestamp,Y)})}),X?(0,C.jsx)(`span`,{className:`ds-feed__visually-hidden`,children:w.position.replace(`{index}`,String(t+1)).replace(`{total}`,String(L))}):null,e.content]})})})},e.id)}),L===0&&!i&&!r?(0,C.jsx)(`div`,{className:`ds-feed__empty-state`,"data-part":`emptyState`,children:(0,C.jsx)(c,{tone:`muted`,size:`sm`,overrides:J.emptyState,children:w.empty})}):null,Z]})]})},P.__docgenInfo={description:"Feed — Design Schema, category: container.\n\nWhen to use:\nUse a Feed for a stream of similar, time-ordered items whose total is unknown or large: activity, notifications, comments, posts, audit events. Each item is a Card with a heading and a time. Use `newItemsCount` with `onShowNew` for live streams rather than inserting items while the reader is looking; use `onItemVisible` to mark things read.",methods:[],displayName:`Feed`,props:{label:{required:!0,tsType:{name:`string`},description:`What the feed contains ("Activity", "Notifications").`},items:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
  id: string;
  heading: string;
  timestamp: string;
  content: ReactNode;
  actions?: ReactNode;
  unread?: boolean;
}`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:`heading`,value:{name:`string`,required:!0}},{key:`timestamp`,value:{name:`string`,required:!0}},{key:`content`,value:{name:`ReactNode`,required:!0}},{key:`actions`,value:{name:`ReactNode`,required:!1}},{key:`unread`,value:{name:`boolean`,required:!1}}]}}],raw:`FeedItem[]`},description:"Articles, newest first. `heading` names the article (a Heading inside the Card); `timestamp` is\nISO and rendered relative from the copy strings, with the absolute time as its title; `unread`\nmarks items the user has not seen."},hasMore:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"More items exist beyond the last; the feed asks for them with `onLoadMore` as the end approaches,\nand once on mount when `items` is empty and not `loading`.",defaultValue:{value:`false`,computed:!1}},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"More items are being fetched; a loading indicator is shown after the last article and the feed is `aria-busy`.",defaultValue:{value:`false`,computed:!1}},newItemsCount:{required:!1,tsType:{name:`union`,raw:`number | undefined`,elements:[{name:`number`},{name:`undefined`}]},description:`Number of newer items available above (from polling or a socket). The feed does not insert
them — that would shift what the reader is looking at — it shows a "Show {count} new" button at
the top which prepends and scrolls.`},headingLevel:{required:!1,tsType:{name:`union`,raw:`FeedHeadingLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:`Heading level for article headings, matching the page outline.`,defaultValue:{value:`'3'`,computed:!1}},endMessage:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Shown after the last item when `hasMore` is false (and `items` is not empty). Defaults to `copy.end`."},onLoadMore:{required:!1,tsType:{name:`union`,raw:`(() => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the last rendered article is within one screen of view (or on Ctrl+End with `hasMore`)."},onShowNew:{required:!1,tsType:{name:`union`,raw:`(() => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the new-items button is pressed; the caller prepends the items and clears `newItemsCount`."},onItemVisible:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with an item id when it has been substantially visible for a moment (mark as read).`},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<FeedOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'itemGap'
| 'articleInset'
| 'articleBodyGap'
| 'timestampSize'
| 'newItemsOffset'
| 'newItemsLayer'
| 'loadingInset'
| 'endMessageInset'
| 'endMessageSize'
| 'emptyStateInset'
| 'emptyStateSize'
| 'fontFamily'`,elements:[{name:`literal`,value:`'itemGap'`},{name:`literal`,value:`'articleInset'`},{name:`literal`,value:`'articleBodyGap'`},{name:`literal`,value:`'timestampSize'`},{name:`literal`,value:`'newItemsOffset'`},{name:`literal`,value:`'newItemsLayer'`},{name:`literal`,value:`'loadingInset'`},{name:`literal`,value:`'endMessageInset'`},{name:`literal`,value:`'endMessageSize'`},{name:`literal`,value:`'emptyStateInset'`},{name:`literal`,value:`'emptyStateSize'`},{name:`literal`,value:`'fontFamily'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<FeedOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<FeedOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDivElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var I,L,R,z,B,V,H,U,W,G,K,q,J,Y;function X(){return(X=e((()=>{a(),F(),l(),s(),I=n(),L={title:`Feed/React`,component:P,tags:[`autodocs`],args:{label:`Activity`,items:[{id:`a1`,heading:`Ana commented on Invoice 42`,timestamp:`2026-09-15T09:00:00Z`,content:(0,I.jsx)(c,{children:`Looks right to me.`}),actions:(0,I.jsx)(o,{label:`Reply`,variant:`secondary`,size:`sm`}),unread:!0},{id:`a2`,heading:`Bo approved Invoice 41`,timestamp:`2026-09-14T16:20:00Z`,content:(0,I.jsx)(u,{href:`#invoice-41`,label:`Open Invoice 41`})},{id:`a3`,heading:`Cy exported the March report`,timestamp:`2026-09-10T12:00:00Z`,content:(0,I.jsx)(c,{children:`The export is ready to download.`}),actions:(0,I.jsx)(o,{label:`Download`,variant:`secondary`,size:`sm`})}],hasMore:!1,loading:!1,headingLevel:`3`},argTypes:{headingLevel:{control:`inline-radio`,options:[`2`,`3`,`4`]},onLoadMore:{action:`onLoadMore`},onShowNew:{action:`onShowNew`},onItemVisible:{action:`onItemVisible`}}},R={},z={args:{headingLevel:`2`}},B={args:{headingLevel:`3`}},V={args:{headingLevel:`4`}},H={args:{hasMore:!0,loading:!0}},U={args:{items:[],hasMore:!1}},W={args:{label:`Activity`,hasMore:!0,items:[{id:`a1`,heading:`Ana commented on Invoice 42`,timestamp:`2026-09-15T09:00:00Z`,content:`Looks right to me.`},{id:`a2`,heading:`Bo approved Invoice 41`,timestamp:`2026-09-14T16:20:00Z`,content:`Approved for payment.`}]}},G={args:{label:`Notifications`,newItemsCount:3,items:[{id:`n1`,heading:`Your export is ready`,timestamp:`2026-09-15T08:00:00Z`,content:`The March export finished.`,unread:!0},{id:`n2`,heading:`Invoice 42 was paid`,timestamp:`2026-09-14T11:00:00Z`,content:`Payment received.`}]}},K={args:{label:`Activity`,hasMore:!1,endMessage:`That is everything from this week.`,items:[{id:`a1`,heading:`Bo approved Invoice 41`,timestamp:`2026-09-14T16:20:00Z`,content:`Approved for payment.`}]}},q={args:{label:`Audit events`,hasMore:!0,loading:!0,headingLevel:`2`,items:[{id:`e1`,heading:`Role changed for Ana`,timestamp:`2026-09-15T07:00:00Z`,content:`Editor to Admin.`}]}},J={args:{newItemsCount:2}},Y=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`Loading`,`Empty`,`ActivityStream`,`NotificationsWithUnreadItems`,`CaughtUp`,`LoadingTheNextPage`,`Keyboard`],R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3'
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4'
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    hasMore: true,
    loading: true
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    items: [],
    hasMore: false
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    newItemsCount: 2
  }
}`,...J.parameters?.docs?.source},description:{story:`Present with the new-items button and three focusable children inside the articles.`,...J.parameters?.docs?.description}}}})))()}X();export{W as ActivityStream,K as CaughtUp,R as Default,U as Empty,z as HeadingLevel2,B as HeadingLevel3,V as HeadingLevel4,J as Keyboard,H as Loading,q as LoadingTheNextPage,G as NotificationsWithUnreadItems,Y as __namedExportsOrder,L as default};