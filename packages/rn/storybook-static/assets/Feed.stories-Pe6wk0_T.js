import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{c as r,h as i,l as ee,m as a,n as o,o as s,r as c,t as l}from"./decorators-Dl4455ZU.js";import{n as u,t as te}from"./FlatList-B--84B_m.js";import{n as d,r as f}from"./Link-Bw8MWX3a.js";import{c as p,l as m,r as h}from"./iframe-CAToN8Eb.js";import{n as g,t as _}from"./Button-B0Tk0pjd.js";import{n as v,t as y}from"./Stack-l7fs4Elr.js";import{n as b,t as ne}from"./Card-DUGvBOuT.js";import{n as x,t as re}from"./ProgressBar-CSxdk7B0.js";function ie(e,t){let n=new Date(e).getTime();if(!Number.isFinite(n))return e;let r=Math.max(0,t-n);return r<O?T.justNow:r<k?T.minutesAgo(Math.floor(r/O)):r<A?T.hoursAgo(Math.floor(r/k)):r<j?T.daysAgo(Math.floor(r/A)):new Intl.DateTimeFormat(void 0,{dateStyle:`medium`}).format(n)}function S({label:e,items:t,hasMore:n=!1,loading:r=!1,newItemsCount:i,headingLevel:o=`3`,endMessage:s,overrides:l,ref:u,onEndReached:d,onShowNew:f,onViewableItemsChanged:m}){let{tokens:h}=p(),g=(e,t)=>e?ee(h,e):t,v=g(l?.itemGap,h.layoutGapNormal),b=g(l?.newItemsOffset,h.space3),x=g(l?.newItemsLayer,h.layerRaised),S=g(l?.loadingInset,h.layoutInsetMd),O=g(l?.endMessageInset,h.layoutInsetMd),k=g(l?.emptyStateInset,h.layoutInsetMd),A=l?.articleInset,j=l?.articleBodyGap,M=l?.timestampSize,N=l?.endMessageSize,P=l?.emptyStateSize,F=l?.fontFamily,I=C.useMemo(()=>A?{paddingBlock:A,paddingInline:A}:void 0,[A]),L=C.useMemo(()=>({gap:j}),[j]),R=C.useMemo(()=>({fontSize:M,fontFamily:F}),[M,F]),z=C.useMemo(()=>({fontSize:N,fontFamily:F}),[N,F]),B=C.useMemo(()=>({fontSize:P,fontFamily:F}),[P,F]),V=C.useMemo(()=>({fontFamily:F}),[F]),H=C.useMemo(()=>({fontFamily:F}),[F]),U=C.useRef(!1);C.useEffect(()=>{e===``&&!U.current&&(U.current=!0,console.warn('Feed: `label` is empty; the feed has no accessible name. Say what the feed contains ("Activity").'))},[e]);let W=C.useRef(d);C.useEffect(()=>{W.current=d},[d]);let G=t.length===0;C.useEffect(()=>{G&&n&&!r&&W.current?.()},[G,n,r]);let K=()=>{n&&!r&&!G&&d?.()},q=C.useRef(m);C.useEffect(()=>{q.current=m},[m]);let J=C.useRef(new Set),Y=C.useRef(({changed:e})=>{for(let t of e)if(t.isViewable&&t.item!=null){let{id:e}=t.item;J.current.has(e)||(J.current.add(e),q.current?.(e))}}).current,X=n?void 0:t.length,Z=h.colorControlSelectedBackground,Q=h.borderWidthFocus,$=C.useCallback(({item:e,index:t})=>(0,w.jsxs)(a,{testID:`Feed.article`,style:e.unread?{borderStartWidth:Q,borderStartColor:Z}:void 0,children:[e.unread?(0,w.jsx)(a,{style:E,children:(0,w.jsx)(c,{overrides:V,children:T.unread})}):null,X===void 0?null:(0,w.jsx)(a,{style:E,children:(0,w.jsx)(c,{overrides:V,children:T.position(t+1,X)})}),(0,w.jsx)(ne,{heading:e.heading,headingLevel:o,inset:`md`,overrides:I,footer:e.actions==null?void 0:(0,w.jsx)(a,{testID:`Feed.articleActions`,children:e.actions}),children:(0,w.jsx)(a,{testID:`Feed.articleBody`,children:(0,w.jsxs)(y,{gap:`tight`,overrides:L,children:[(0,w.jsx)(a,{testID:`Feed.timestamp`,children:(0,w.jsx)(c,{size:`xs`,tone:`muted`,overrides:R,children:ie(e.timestamp,Date.now())})}),typeof e.content==`string`||typeof e.content==`number`?(0,w.jsx)(c,{overrides:V,children:e.content}):e.content]})})})]}),[L,I,o,V,R,X,Z,Q]),ae=r?(0,w.jsx)(a,{testID:`Feed.loadingIndicator`,style:{padding:S},children:(0,w.jsx)(re,{label:T.loading,hideLabel:!0})}):!n&&!G?(0,w.jsx)(a,{testID:`Feed.endMessage`,style:{padding:O},children:(0,w.jsx)(c,{size:`sm`,tone:`muted`,overrides:z,children:s??T.end})}):void 0,oe=!n&&!r?(0,w.jsx)(a,{testID:`Feed.emptyState`,style:{padding:k},children:(0,w.jsx)(c,{size:`sm`,tone:`muted`,overrides:B,children:T.empty})}):void 0;return(0,w.jsxs)(a,{ref:u,testID:`Feed`,children:[i!==void 0&&i>0?(0,w.jsx)(a,{testID:`Feed.newItemsButton`,accessibilityLiveRegion:`polite`,style:{alignSelf:`flex-start`,paddingTop:b,zIndex:x},children:(0,w.jsx)(_,{label:T.showNew(Math.trunc(i)),variant:`secondary`,size:`sm`,overrides:H,onPress:f})}):null,(0,w.jsx)(te,{testID:`Feed.container`,accessibilityRole:`list`,accessibilityLabel:e,accessibilityState:{busy:r},data:t,keyExtractor:e=>e.id,renderItem:$,contentContainerStyle:{gap:v},onEndReached:K,onEndReachedThreshold:1,viewabilityConfig:D,onViewableItemsChanged:Y,maintainVisibleContentPosition:{minIndexForVisible:0},ListFooterComponent:ae,ListEmptyComponent:oe})]})}var C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{C=t(n(),1),u(),i(),r(),g(),b(),x(),v(),s(),h(),w=m(),T={showNew:e=>`Show ${e} new`,loading:`Loading more`,end:`You are all caught up.`,unread:`unread`,position:(e,t)=>`${e} of ${t}`,empty:`Nothing here yet.`,justNow:`just now`,minutesAgo:e=>`${e} min ago`,hoursAgo:e=>`${e} hr ago`,daysAgo:e=>`${e} d ago`},E={position:`absolute`,width:1,height:1,overflow:`hidden`},D={itemVisiblePercentThreshold:50,minimumViewTime:1e3},O=6e4,k=60*O,A=24*k,j=7*A,S.__docgenInfo={description:'Feed — a stream of time-ordered articles that grows as the reader nears the end, with\nnewer items offered by a button rather than inserted under the reader.\n\nRenders a `FlatList` (`accessibilityRole="list"`, `accessibilityLabel={label}`, busy\nwhile `loading`) of `Card`s. Cards are left un-collapsed so action Buttons and Links in\nan article stay individually focusable; the hidden "unread" word and, when the total\nis known (`hasMore` false), the "{index} of {total}" position sit before each Card,\nbecause Card takes a heading string and a footer slot with nothing between them.\n`onEndReached` fires with threshold one screen; `maintainVisibleContentPosition` keeps\nthe reader\'s place when the caller prepends after `onShowNew`. The new-items row is a\n`View` above the list, so it never scrolls away, and is `accessibilityLiveRegion="polite"`\n— Android announces the count; on iOS VoiceOver users reach the button at the top.\nWhile `loading` with no items the indicator shows, not `copy.empty`, so an empty feed\nabout to fetch stays blank rather than flashing it. There is no hardware keyboard feed\nmodel on native (no Page or Ctrl keys); screen readers browse with their own gestures.\nThe absolute time is not exposed on native.',methods:[],displayName:`Feed`,props:{label:{required:!0,tsType:{name:`string`},description:`What the feed contains ("Activity", "Notifications"). The list's accessible name; an empty label warns in development.`},items:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
  id: string;
  heading: string;
  timestamp: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  unread?: boolean;
}`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:`heading`,value:{name:`string`,required:!0}},{key:`timestamp`,value:{name:`string`,required:!0}},{key:`content`,value:{name:`ReactReactNode`,raw:`React.ReactNode`,required:!0}},{key:`actions`,value:{name:`ReactReactNode`,raw:`React.ReactNode`,required:!1}},{key:`unread`,value:{name:`boolean`,required:!1}}]}}],raw:`FeedItem[]`},description:'Articles, newest first. `heading` names the article (the Card\'s heading); `timestamp`\nis ISO and rendered relative from the copy strings ("3 min ago", the absolute date from\nseven days on), computed at render and not ticking; `unread` marks items the user has\nnot seen. String or number `content` is wrapped in the package `Text`; other content\nrenders as given. The absolute time is not exposed on native.'},hasMore:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"More items exist beyond the last; the feed asks for them with `onEndReached` as the end\napproaches, and whenever `items` is empty and not `loading` — on mount and again if the\ncaller clears `items` — so an empty feed fetches its first page itself. Never while `loading`.",defaultValue:{value:`false`,computed:!1}},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`More items are being fetched; a loading indicator is shown after the last article and the list is marked busy.`,defaultValue:{value:`false`,computed:!1}},newItemsCount:{required:!1,tsType:{name:`union`,raw:`number | undefined`,elements:[{name:`number`},{name:`undefined`}]},description:`Number of newer items available above. The feed does not insert them; it shows a "Show {count} new" button above the list. Whole numbers only.`},headingLevel:{required:!1,tsType:{name:`union`,raw:`FeedHeadingLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:"Heading level for article headings. React Native has no heading levels: headings carry the `header` role and this controls only typography.",defaultValue:{value:`'3'`,computed:!1}},endMessage:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Shown after the last item when `hasMore` is false and `items` is not empty. Defaults to `copy.end`."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<FeedOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'itemGap'
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
| 'fontFamily'`,elements:[{name:`literal`,value:`'itemGap'`},{name:`literal`,value:`'articleInset'`},{name:`literal`,value:`'articleBodyGap'`},{name:`literal`,value:`'timestampSize'`},{name:`literal`,value:`'newItemsOffset'`},{name:`literal`,value:`'newItemsLayer'`},{name:`literal`,value:`'loadingInset'`},{name:`literal`,value:`'endMessageInset'`},{name:`literal`,value:`'endMessageSize'`},{name:`literal`,value:`'emptyStateInset'`},{name:`literal`,value:`'emptyStateSize'`},{name:`literal`,value:`'fontFamily'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<FeedOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<FeedOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."},ref:{required:!1,tsType:{name:`union`,raw:`React.Ref<ViewInstance> | undefined`,elements:[{name:`ReactRef`,raw:`React.Ref<ViewInstance>`,elements:[{name:`ViewInstance`}]},{name:`undefined`}]},description:"The root `View`."},onEndReached:{required:!1,tsType:{name:`union`,raw:`(() => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Load more (`onLoadMore`): the last article is within one screen of view with `hasMore`, or an empty feed with `hasMore` and not `loading`."},onShowNew:{required:!1,tsType:{name:`union`,raw:`(() => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"The new-items button was pressed; the caller prepends the items and clears `newItemsCount`."},onViewableItemsChanged:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Item visible (`onItemVisible`): the item has been at least half visible for a second (mark as read)."}}}})))()}var N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{n(),g(),M(),f(),v(),s(),l(),N=m(),P=Date.now(),F=e=>new Date(P-e*6e4).toISOString(),I=[{id:`1`,heading:`Ana commented on Invoice 42`,timestamp:F(3),content:(0,N.jsx)(c,{children:`Looks right to me.`}),actions:(0,N.jsx)(_,{label:`Reply`,variant:`secondary`,size:`sm`}),unread:!0},{id:`2`,heading:`Priya assigned you Ticket 118`,timestamp:F(47),content:(0,N.jsxs)(y,{gap:`tight`,children:[(0,N.jsx)(c,{children:`The export is missing line items.`}),(0,N.jsx)(d,{href:`#`,label:`Open ticket`})]})},{id:`3`,heading:`Bo approved Invoice 41`,timestamp:F(180),content:(0,N.jsx)(c,{children:`Approved for payment.`})}],L={title:`Feed/React Native`,component:S,decorators:[o()],args:{label:`Activity`,items:I,hasMore:!0,loading:!1,headingLevel:`3`}},R={},z={args:{headingLevel:`2`}},B={args:{headingLevel:`3`}},V={args:{headingLevel:`4`}},H={args:{loading:!0}},U={args:{items:[],loading:!0}},W={args:{hasMore:!1}},G={args:{newItemsCount:4}},K={args:{items:[],hasMore:!1}},q={args:{newItemsCount:3,hasMore:!1}},J={args:{label:`Activity`,hasMore:!0,items:[{id:`a1`,heading:`Ana commented on Invoice 42`,timestamp:`2026-09-15T09:00:00Z`,content:`Looks right to me.`},{id:`a2`,heading:`Bo approved Invoice 41`,timestamp:`2026-09-14T16:20:00Z`,content:`Approved for payment.`}]}},Y={args:{label:`Notifications`,newItemsCount:3,items:[{id:`n1`,heading:`Your export is ready`,timestamp:`2026-09-15T08:00:00Z`,content:`The March export finished.`,unread:!0},{id:`n2`,heading:`Invoice 42 was paid`,timestamp:`2026-09-14T11:00:00Z`,content:`Payment received.`}]}},X={args:{label:`Activity`,hasMore:!1,endMessage:`That is everything from this week.`,items:[{id:`a1`,heading:`Bo approved Invoice 41`,timestamp:`2026-09-14T16:20:00Z`,content:`Approved for payment.`}]}},Z={args:{label:`Audit events`,hasMore:!0,loading:!0,headingLevel:`2`,items:[{id:`e1`,heading:`Role changed for Ana`,timestamp:`2026-09-15T07:00:00Z`,content:`Editor to Admin.`}]}},Q=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`Loading`,`LoadingEmpty`,`EndOfFeed`,`NewItemsAvailable`,`Empty`,`Keyboard`,`ActivityStream`,`NotificationsWithUnreadItems`,`CaughtUp`,`LoadingTheNextPage`],R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
    loading: true
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    items: [],
    loading: true
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    hasMore: false
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    newItemsCount: 4
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    items: [],
    hasMore: false
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    newItemsCount: 3,
    hasMore: false
  }
}`,...q.parameters?.docs?.source},description:{story:`Three newer items waiting above and articles with actions and a Link: at least three focusable children.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source}}}})))()}$();export{J as ActivityStream,X as CaughtUp,R as Default,K as Empty,W as EndOfFeed,z as HeadingLevel2,B as HeadingLevel3,V as HeadingLevel4,q as Keyboard,H as Loading,U as LoadingEmpty,Z as LoadingTheNextPage,G as NewItemsAvailable,Y as NotificationsWithUnreadItems,Q as __namedExportsOrder,L as default};