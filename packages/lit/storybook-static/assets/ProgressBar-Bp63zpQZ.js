import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,T as n,_ as r,a as i,b as a,c as o,f as s,g as ee,h as c,i as te,o as ne,p as re,u as l,v as u,w as d}from"./if-defined-CARySXJh.js";import{a as ie,r as ae}from"./directive-helpers-DkZg2Mgc.js";import{t as oe}from"./Text-BrJPDVza.js";import{n as se,r as ce,t as le}from"./directive-CZiujxgm.js";import{n as f,t as p}from"./class-map-C-hUkrHk.js";import{r as m,t as h}from"./style-map-Dfwb0mxD.js";var g;function _(){return(_=e((()=>{n(),ce(),ae(),g=le(class extends se{constructor(){super(...arguments),this.key=a}render(e,t){return this.key=e,t}update(e,[t,n]){return t!==this.key&&(ie(e),this.key=t),n}})})))()}function v(){return(v=e((()=>{_()})))()}function ue(e,t){return e.replace(/\{(\w+)\}/g,(e,n)=>t[n]??e)}function de(e,t,n){return q.format(n>t?(e-t)/(n-t):0)}function y(e,t){return typeof e==`number`&&Number.isFinite(e)?e:t}function b(e){let t={};for(let n of Object.keys(e)){let r=e[n];r&&(t[n]=r)}return Object.keys(t).length>0?t:void 0}var x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{ee(),r(),ne(),p(),v(),h(),i(),oe(),K={progress:`{label}: {value}`,complete:`{label}: complete`,indeterminate:`{label}: in progress`},q=new Intl.NumberFormat(void 0,{style:`percent`,maximumFractionDigits:0}),J=4,Y=new Set,X={fromAttribute(e){return e===null},toAttribute(e){return e?null:``}},Z={track:`--ds-progress-bar-track`,trackHeight:`--ds-progress-bar-track-height`,radius:`--ds-progress-bar-radius`,partGap:`--ds-progress-bar-part-gap`,labelGap:`--ds-progress-bar-label-gap`,transition:`--ds-progress-bar-transition`,indeterminateLoop:`--ds-progress-bar-indeterminate-loop`,sweepEasing:`--ds-progress-bar-sweep-easing`},new class extends re{static[class extends u{static{({e:[S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G],c:[Q,x]}=c(this,[s(`ds-progress-bar`)],[[l({type:String}),1,`label`],[l({type:Number}),1,`value`],[l({type:Number}),1,`min`],[l({type:Number}),1,`max`],[l({attribute:!1}),1,`formatValue`],[l({attribute:`hide-value`,reflect:!0,converter:X}),1,`showValue`],[l({type:Boolean,reflect:!0,attribute:`hide-label`}),1,`hideLabel`],[l({type:String,reflect:!0}),1,`tone`],[l({type:String,reflect:!0}),1,`announce`],[l({attribute:!1}),1,`overrides`],[o(),1,`liveMessage`],[o(),1,`liveSeq`]],0,void 0,u))}#e=S(this,``);get label(){return this.#e}set label(e){this.#e=e}#t=(C(this),w(this));get value(){return this.#t}set value(e){this.#t=e}#n=(T(this),E(this,0));get min(){return this.#n}set min(e){this.#n=e}#r=(D(this),O(this,100));get max(){return this.#r}set max(e){this.#r=e}#i=(k(this),A(this));get formatValue(){return this.#i}set formatValue(e){this.#i=e}#a=(j(this),M(this,!0));get showValue(){return this.#a}set showValue(e){this.#a=e}#o=(N(this),P(this,!1));get hideLabel(){return this.#o}set hideLabel(e){this.#o=e}#s=(F(this),I(this,`neutral`));get tone(){return this.#s}set tone(e){this.#s=e}#c=(L(this),R(this,`complete`));get announce(){return this.#c}set announce(e){this.#c=e}#l=(z(this),B(this));get overrides(){return this.#l}set overrides(e){this.#l=e}#u=(V(this),H(this,``));get liveMessage(){return this.#u}set liveMessage(e){this.#u=e}#d=(U(this),W(this,0));get liveSeq(){return this.#d}set liveSeq(e){this.#d=e}record=(G(this),{mounted:!1,indeterminate:!1,validRange:!1,tier:0,complete:!1});pendingMessage;frame=0;connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`ProgressBar`),this.setAttribute(`role`,`progressbar`)}disconnectedCallback(){super.disconnectedCallback(),cancelAnimationFrame(this.frame)}get isIndeterminate(){return this.value===void 0||this.value===null}get bounds(){let e=y(this.min,0),t=y(this.max,100);return{min:e,max:t,valid:t>e}}get clampedValue(){let{min:e,max:t,valid:n}=this.bounds;return this.isIndeterminate||!n?e:Math.min(t,Math.max(e,y(this.value,e)))}get fraction(){let{min:e,max:t,valid:n}=this.bounds;return this.isIndeterminate||!n?0:(this.clampedValue-e)/(t-e)}get displayText(){let{min:e,max:t}=this.bounds;return(this.formatValue??de)(this.clampedValue,e,t)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),(!this.hasUpdated||e.has(`value`)||e.has(`min`)||e.has(`max`))&&this.updateAnnouncements()}firstUpdated(){let e=this.pendingMessage;e!==void 0&&(this.pendingMessage=void 0,this.frame=requestAnimationFrame(()=>this.emit(e)))}updated(){this.syncHostAria()}render(){let e=this.isIndeterminate,t=this.showValue&&!e,n=this.overrides,r=d`<ds-text
      part="label"
      data-part="label"
      element="span"
      size="sm"
      weight="medium"
      tone="default"
      .overrides=${b({fontSize:n?.labelSize,fontWeight:n?.labelWeight,fontFamily:n?.fontFamily,lineHeight:n?.lineHeight})}
      >${this.label}</ds-text
    >`;return d`
      <div part="container" data-part="container">
        <!-- With nothing visible in it the row takes no space, but the header element stays with its
             data-part and the label inside it; with only the value text visible it aligns to the end. -->
        <div
          part="header"
          data-part="header"
          class=${f({"visually-hidden":this.hideLabel&&!t,"label-hidden":this.hideLabel&&t})}
        >
          ${this.hideLabel&&t?d`<span class="visually-hidden">${r}</span>`:r}
          ${t?d`<ds-text
                part="valueText"
                data-part="valueText"
                element="span"
                size="sm"
                tone="muted"
                .overrides=${b({fontSize:n?.valueSize,fontFamily:n?.fontFamily,lineHeight:n?.lineHeight})}
                >${this.displayText}</ds-text
              >`:a}
        </div>
        <div part="track" data-part="track">
          <div
            part="fill"
            data-part="fill"
            class=${f({indeterminate:e})}
            style=${e?a:m({inlineSize:`${this.fraction*100}%`})}
          ></div>
        </div>
        <!-- Not an anatomy part: the bar is never focusable, so progress is learned from here. -->
        <div class="visually-hidden" role="status" aria-live="polite">
          ${this.liveMessage?g(this.liveSeq,d`<span>${this.liveMessage}</span>`):a}
        </div>
      </div>
    `}syncHostAria(){let{min:e,max:t}=this.bounds,n=this.isIndeterminate;this.setOrRemove(`aria-label`,this.label||null),this.setOrRemove(`aria-valuemin`,String(e)),this.setOrRemove(`aria-valuemax`,String(t)),this.setOrRemove(`aria-valuenow`,n?null:String(this.clampedValue)),this.setOrRemove(`aria-valuetext`,n?null:this.displayText),this.setOrRemove(`aria-busy`,n?`true`:null)}setOrRemove(e,t){t===null?this.hasAttribute(e)&&this.removeAttribute(e):this.getAttribute(e)!==t&&this.setAttribute(e,t)}updateAnnouncements(){let e=this.record,t=!e.mounted;e.mounted=!0;let{max:n,valid:r}=this.bounds;if(this.isIndeterminate){e.validRange=r,(t||!e.indeterminate)&&(e.indeterminate=!0,e.tier=0,e.complete=!1,this.announce!==`none`&&this.say(K.indeterminate));return}e.indeterminate=!1;let i=r&&!e.validRange;if(e.validRange=r,!r)return;let a=Math.floor(this.fraction*J),o=this.clampedValue>=n;if(t||i){e.tier=a,e.complete=o;return}if(a<e.tier&&(e.tier=a),o||(e.complete=!1),o&&!e.complete){e.complete=!0,e.tier=a,this.announce!==`none`&&this.say(K.complete);return}a>e.tier&&(e.tier=a,this.announce===`milestones`&&this.say(K.progress))}say(e){let t=ue(e,{label:this.label,value:this.isIndeterminate?``:this.displayText});this.hasUpdated?this.emit(t):this.pendingMessage=t}emit(e){this.liveMessage=e,this.liveSeq+=1}warnInvalidRange(){let{min:e,max:t,valid:n}=this.bounds;if(n)return;let r=`${e}:${t}`;Y.has(r)||(Y.add(r),console.warn(`ProgressBar: \`max\` (${t}) must be greater than \`min\` (${e}); the bar renders empty.`))}applyOverrides(){for(let e of Object.keys(Z)){let t=Z[e];if(t===void 0)continue;let n=this.overrides?.[e];n===void 0?this.style.removeProperty(t):this.style.setProperty(t,te(n))}}}];styles=t`
    :host {
      display: block;
      --ds-progress-bar-track: var(--color-background-strong);
      --ds-progress-bar-track-height: var(--space-2);
      --ds-progress-bar-radius: var(--radius-full);
      --ds-progress-bar-part-gap: var(--space-1);
      --ds-progress-bar-label-gap: var(--space-2);
      --ds-progress-bar-transition: var(--motion-duration-base);
      --ds-progress-bar-indeterminate-loop: var(--motion-duration-loop);
      --ds-progress-bar-sweep-easing: var(--motion-easing-standard);
    }

    :host([hidden]) {
      display: none;
    }

    /* partGap: space.1 between the label row and the track */
    [data-part='container'] {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--ds-progress-bar-part-gap);
      min-inline-size: 0;
    }

    /* labelGap: space.2 between the label (inline start) and the value text (inline end) */
    [data-part='header'] {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--ds-progress-bar-label-gap);
    }

    /* hideLabel with visible value text: the hidden label leaves the flow, the value text stays at the end. */
    [data-part='header'].label-hidden {
      justify-content: flex-end;
    }

    /* track: color.background.strong; trackHeight: space.2; radius: radius.full (the track clips the fill) */
    [data-part='track'] {
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      inline-size: 100%;
      block-size: var(--ds-progress-bar-track-height);
      border-radius: var(--ds-progress-bar-radius);
      background-color: var(--ds-progress-bar-track);
    }

    /* fill: color.control.selectedBackground, locked — the color guaranteed 3:1 against the page. */
    [data-part='fill'] {
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      inline-size: 0;
      border-radius: var(--ds-progress-bar-radius);
      background-color: var(--color-control-selected-background);
    }
    /* fillSuccess: color.status.success.icon, locked */
    :host([tone='success']) [data-part='fill'] {
      background-color: var(--color-status-success-icon);
    }
    /* fillDanger: color.status.danger.icon, locked */
    :host([tone='danger']) [data-part='fill'] {
      background-color: var(--color-status-danger-icon);
    }

    /* The sweeping fill is one third of the track: geometry, not a token. */
    [data-part='fill'].indeterminate {
      inline-size: calc(100% / 3);
    }

    /* transition: fill inline-size change over motion.duration.base with motion.easing.standard. */
    @media (prefers-reduced-motion: no-preference) {
      [data-part='fill']:not(.indeterminate) {
        transition: inline-size var(--ds-progress-bar-transition) var(--motion-easing-standard);
      }

      /* indeterminateLoop + sweepEasing: the fill travels from wholly before the track to wholly after it. */
      [data-part='fill'].indeterminate {
        animation: ds-progress-bar-sweep var(--ds-progress-bar-indeterminate-loop)
          var(--ds-progress-bar-sweep-easing) infinite;
      }
      :host(:dir(rtl)) [data-part='fill'].indeterminate {
        animation-name: ds-progress-bar-sweep-rtl;
      }
    }

    /* Reduced motion: no sweep — the fill is static and full-width at opacity.disabled, keeping its tone. */
    @media (prefers-reduced-motion: reduce) {
      [data-part='fill'].indeterminate {
        inline-size: 100%;
        opacity: var(--opacity-disabled);
      }
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

    /* Visually hidden: the hidden label, the empty header row, and the live region. */
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
  `;constructor(){super(Q),x()}}})))()}export{$ as t};