import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,T as n,_ as r,a as i,b as a,c as o,f as ee,g as s,h as te,i as ne,o as re,p as c,u as l,v as u,w as d}from"./if-defined-CARySXJh.js";import{a as ie,r as f}from"./directive-helpers-DkZg2Mgc.js";import{t as p}from"./Text-BrJPDVza.js";import{n as m,r as h,t as ae}from"./directive-CZiujxgm.js";import{n as g,t as oe}from"./class-map-C-hUkrHk.js";import{r as se,t as ce}from"./style-map-Dfwb0mxD.js";var _;function v(){return(v=e((()=>{n(),h(),f(),_=ae(class extends m{constructor(){super(...arguments),this.key=a}render(e,t){return this.key=e,t}update(e,[t,n]){return t!==this.key&&(ie(e),this.key=t),n}})})))()}function y(){return(y=e((()=>{v()})))()}var b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{s(),r(),re(),oe(),y(),ce(),i(),p(),G=(e,t)=>`${e}: ${t}`,K=e=>`${e}: complete`,q=e=>`${e}: in progress`,J=new Intl.NumberFormat(void 0,{style:`percent`,maximumFractionDigits:0}),Y=4,X={fromAttribute(e){return e===null},toAttribute(e){return e?null:``}},Z={track:`--ds-progress-bar-track`,trackHeight:`--ds-progress-bar-track-height`,radius:`--ds-progress-bar-radius`,labelSize:`--ds-progress-bar-label-size`,labelWeight:`--ds-progress-bar-label-weight`,valueSize:`--ds-progress-bar-value-size`,fontFamily:`--ds-progress-bar-font-family`,lineHeight:`--ds-progress-bar-line-height`,partGap:`--ds-progress-bar-part-gap`,labelGap:`--ds-progress-bar-label-gap`,transition:`--ds-progress-bar-transition`,indeterminateLoop:`--ds-progress-bar-indeterminate-loop`,sweepEasing:`--ds-progress-bar-sweep-easing`},new class extends c{static[class extends u{static{({e:[x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W],c:[Q,b]}=te(this,[ee(`ds-progress-bar`)],[[l({type:String}),1,`label`],[l({type:Number}),1,`value`],[l({type:Number}),1,`min`],[l({type:Number}),1,`max`],[l({attribute:!1}),1,`formatValue`],[l({attribute:`hide-value`,reflect:!0,converter:X}),1,`showValue`],[l({type:Boolean,reflect:!0,attribute:`hide-label`}),1,`hideLabel`],[l({type:String,reflect:!0}),1,`tone`],[l({type:String,reflect:!0}),1,`announce`],[l({attribute:!1}),1,`overrides`],[o(),1,`liveMessage`],[o(),1,`liveSeq`]],0,void 0,u))}#e=x(this,``);get label(){return this.#e}set label(e){this.#e=e}#t=(S(this),C(this));get value(){return this.#t}set value(e){this.#t=e}#n=(w(this),T(this,0));get min(){return this.#n}set min(e){this.#n=e}#r=(E(this),D(this,100));get max(){return this.#r}set max(e){this.#r=e}#i=(O(this),k(this));get formatValue(){return this.#i}set formatValue(e){this.#i=e}#a=(A(this),j(this,!0));get showValue(){return this.#a}set showValue(e){this.#a=e}#o=(M(this),N(this,!1));get hideLabel(){return this.#o}set hideLabel(e){this.#o=e}#s=(P(this),F(this,`neutral`));get tone(){return this.#s}set tone(e){this.#s=e}#c=(I(this),L(this,`complete`));get announce(){return this.#c}set announce(e){this.#c=e}#l=(R(this),z(this));get overrides(){return this.#l}set overrides(e){this.#l=e}#u=(B(this),V(this,``));get liveMessage(){return this.#u}set liveMessage(e){this.#u=e}#d=(H(this),U(this,0));get liveSeq(){return this.#d}set liveSeq(e){this.#d=e}tier=(W(this),0);wasIndeterminate;pendingMessage;connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`ProgressBar`),this.setAttribute(`role`,`progressbar`)}get isIndeterminate(){return this.value===void 0||this.value===null}get isRange(){return Number(this.max)>Number(this.min)}get clampedValue(){let e=Number(this.min),t=Number(this.value);return this.isIndeterminate||!this.isRange||!Number.isFinite(t)?e:Math.min(Number(this.max),Math.max(e,t))}get fraction(){if(this.isIndeterminate||!this.isRange)return 0;let e=Number(this.min);return(this.clampedValue-e)/(Number(this.max)-e)}get displayText(){return this.formatValue?this.formatValue(this.clampedValue,Number(this.min),Number(this.max)):J.format(this.fraction)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),(e.has(`value`)||e.has(`min`)||e.has(`max`)||!this.hasUpdated)&&this.updateAnnouncements()}firstUpdated(){let e=this.pendingMessage;e!==void 0&&(this.pendingMessage=void 0,requestAnimationFrame(()=>this.speak(e)))}updated(){this.syncHostAria()}render(){let e=this.isIndeterminate,t=this.showValue&&!e;return d`
      <div data-part="container" part="container">
        <div
          data-part="header"
          part="header"
          class=${g({"visually-hidden":this.hideLabel&&!t})}
        >
          <span class=${g({"visually-hidden":this.hideLabel})}>
            <ds-text
              data-part="label"
              part="label"
              element="span"
              size="sm"
              weight="medium"
              tone="default"
              .overrides=${this.textOverrides(`labelSize`,`labelWeight`)}
              >${this.label}</ds-text
            >
          </span>
          ${t?d`<ds-text
                data-part="valueText"
                part="valueText"
                element="span"
                size="sm"
                tone="muted"
                .overrides=${this.textOverrides(`valueSize`)}
                >${this.displayText}</ds-text
              >`:a}
        </div>
        <div data-part="track" part="track">
          <div
            data-part="fill"
            part="fill"
            class=${g({indeterminate:e})}
            style=${e?a:se({inlineSize:`${this.fraction*100}%`})}
          ></div>
        </div>
        <div class="visually-hidden" role="status" aria-live="polite">
          ${_(this.liveSeq,d`<span>${this.liveMessage}</span>`)}
        </div>
      </div>
    `}syncHostAria(){let e=this.isIndeterminate;this.setOrRemove(`aria-label`,this.label||null),this.setOrRemove(`aria-valuemin`,String(Number(this.min))),this.setOrRemove(`aria-valuemax`,String(Number(this.max))),this.setOrRemove(`aria-valuenow`,e?null:String(this.clampedValue)),this.setOrRemove(`aria-valuetext`,e?null:this.displayText),this.setOrRemove(`aria-busy`,e?`true`:null)}setOrRemove(e,t){t===null?this.hasAttribute(e)&&this.removeAttribute(e):this.getAttribute(e)!==t&&this.setAttribute(e,t)}updateAnnouncements(){let e=this.wasIndeterminate===void 0,t=this.isIndeterminate,n=t&&this.wasIndeterminate!==!0;if(this.wasIndeterminate=t,t){this.tier=0,n&&this.announce!==`none`&&this.announceMessage(q(this.label));return}if(!this.isRange){this.tier=0;return}let r=this.clampedValue>=Number(this.max)?Y:Math.floor(this.fraction*Y),i=this.tier;this.tier=r,!(e||r<=i||this.announce===`none`)&&(r===Y?this.announceMessage(K(this.label)):this.announce===`milestones`&&this.announceMessage(G(this.label,this.displayText)))}announceMessage(e){this.hasUpdated?this.speak(e):this.pendingMessage=e}speak(e){this.liveMessage=e,this.liveSeq+=1}textOverrides(e,t){let n=this.overrides,r={};return n?.fontFamily&&(r.fontFamily=n.fontFamily),n?.lineHeight&&(r.lineHeight=n.lineHeight),n?.[e]&&(r.fontSize=n[e]),t&&n?.[t]&&(r.fontWeight=n[t]),r}applyOverrides(){for(let e of Object.keys(Z)){let t=this.overrides?.[e],n=Z[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,ne(t))}}}];styles=t`
    :host {
      display: block;
      --ds-progress-bar-track: var(--color-background-strong);
      --ds-progress-bar-track-height: var(--space-2);
      --ds-progress-bar-radius: var(--radius-full);
      --ds-progress-bar-label-size: var(--font-size-sm);
      --ds-progress-bar-label-weight: var(--font-weight-medium);
      --ds-progress-bar-value-size: var(--font-size-sm);
      --ds-progress-bar-font-family: var(--font-family-body);
      --ds-progress-bar-line-height: var(--font-line-height-normal);
      --ds-progress-bar-part-gap: var(--space-1);
      --ds-progress-bar-label-gap: var(--space-2);
      --ds-progress-bar-transition: var(--motion-duration-base);
      --ds-progress-bar-indeterminate-loop: var(--motion-duration-loop);
      --ds-progress-bar-sweep-easing: var(--motion-easing-standard);
    }

    :host([hidden]) {
      display: none;
    }

    /* partGap: space.1 between the header and the track */
    [data-part='container'] {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--ds-progress-bar-part-gap);
    }

    /* labelGap: space.2 between the label (inline start) and the value text (inline end) */
    [data-part='header'] {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--ds-progress-bar-label-gap);
    }
    /* The visually-hidden label leaves the flow; the value text stays at the inline end. */
    :host([hide-label]) [data-part='header'] {
      justify-content: flex-end;
    }

    .visually-hidden {
      /* literal-ok: standard visually-hidden clip pattern */
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    /* track: color.background.strong; trackHeight: space.2; radius: radius.full (clips the fill) */
    [data-part='track'] {
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      block-size: var(--ds-progress-bar-track-height);
      border-radius: var(--ds-progress-bar-radius);
      background: var(--ds-progress-bar-track);
    }

    /* fill: color.control.selectedBackground (locked) */
    [data-part='fill'] {
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      inline-size: 0;
      border-radius: var(--ds-progress-bar-radius);
      background: var(--color-control-selected-background);
    }
    /* fillSuccess: color.status.success.icon (locked) */
    :host([tone='success']) [data-part='fill'] {
      background: var(--color-status-success-icon);
    }
    /* fillDanger: color.status.danger.icon (locked) */
    :host([tone='danger']) [data-part='fill'] {
      background: var(--color-status-danger-icon);
    }

    @media (prefers-reduced-motion: no-preference) {
      /* transition: fill inline-size change over motion.duration.base, motion.easing.standard */
      [data-part='fill']:not(.indeterminate) {
        transition: inline-size var(--ds-progress-bar-transition) var(--motion-easing-standard);
      }

      /* indeterminateLoop + sweepEasing: a one-third-width fill sweeping from wholly before to wholly after the track */
      [data-part='fill'].indeterminate {
        inline-size: calc(100% / 3);
        animation: ds-progress-bar-sweep var(--ds-progress-bar-indeterminate-loop) var(--ds-progress-bar-sweep-easing)
          infinite;
      }
      :host(:dir(rtl)) [data-part='fill'].indeterminate {
        animation-name: ds-progress-bar-sweep-rtl;
      }
      @keyframes ds-progress-bar-sweep {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(300%);
        }
      }
      @keyframes ds-progress-bar-sweep-rtl {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(-300%);
        }
      }
    }

    /* Reduced motion: no sweep — the fill is static, full-width, at opacity.disabled, keeping its tone color. */
    @media (prefers-reduced-motion: reduce) {
      [data-part='fill'].indeterminate {
        inline-size: 100%;
        opacity: var(--opacity-disabled);
      }
    }
  `;constructor(){super(Q),b()}}})))()}export{$ as t};