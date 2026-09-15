import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,c as n,d as r,f as i,p as a,r as o,s,t as c,u as l,y as u}from"./decorators-BlUBDG4K.js";import{t as d}from"./query-BHY-nhsh.js";import{t as f}from"./Button-TSn-G4Vm.js";import{t as p}from"./Heading-zy-G4KpZ.js";import{t as m}from"./Text-Dgpz9DWN.js";import{t as h}from"./Input-BGhC2i8R.js";import{t as g}from"./Stack-CZSvFm0E.js";import{t as _}from"./Checkbox-D_Ve3Y-V.js";import{t as v}from"./Landmark-SaX6suX5.js";import{t as y}from"./Card-Dlyr1ZnO.js";import{A as b,C as x,D as S,E as C,O as w,S as T,b as E,g as D,h as O,k,x as A}from"./iframe-CsoUKhN4.js";var j,M,N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{r(),i(),c(),v(),x(),g(),p(),D(),b(),S(),h(),f(),_(),k(),w(),O(),y(),m(),C(),T(),E(),R=[{id:`profile`,label:`Profile`},{id:`notifications`,label:`Notifications`},{id:`appearance`,label:`Appearance`},{id:`account`,label:`Account`}],z=[{value:`immediately`,label:`Immediately`},{value:`daily`,label:`Daily digest`},{value:`weekly`,label:`Weekly digest`}],B=[{value:`system`,label:`System`},{value:`light`,label:`Light`},{value:`dark`,label:`Dark`}],V=[{value:`comfortable`,label:`Comfortable`},{value:`compact`,label:`Compact`}],new class extends n{static[class extends a{static{({e:[M,N,P,F,I,L],c:[H,j]}=l(this,[s(`ds-pattern-settings-page`)],[[o(),1,`pushEnabled`],[o(),1,`deleteDialogOpen`],[d(`ds-form`),1,`profileFormEl`]],0,void 0,a))}#e=M(this,!1);get pushEnabled(){return this.#e}set pushEnabled(e){this.#e=e}#t=(N(this),P(this,!1));get deleteDialogOpen(){return this.#t}set deleteDialogOpen(e){this.#t=e}#n=(F(this),I(this));get profileFormEl(){return this.#n}set profileFormEl(e){this.#n=e}render(){return u`
      <ds-landmark role="main">
        <ds-container width="content">
          <ds-stack gap="section" align="stretch">
            <ds-heading level="1">Settings</ds-heading>

            <ds-tabs label="Settings sections" .tabs=${R} keep-mounted>
              <ds-tab-panel id="profile">
                <ds-form
                  name="profile"
                  label="Profile"
                  .errorSummary=${!1}
                  @submit=${this.handleProfileSubmit}
                >
                  <ds-stack gap="loose">
                    <ds-fieldset legend="Your details">
                      <ds-input label="Name" name="name" required></ds-input>
                      <ds-input
                        label="Email"
                        name="email"
                        type="email"
                        required
                        description="We send receipts here."
                      ></ds-input>
                    </ds-fieldset>
                    <ds-fieldset legend="Public profile">
                      <ds-input label="Display name" name="displayName"></ds-input>
                      <ds-input label="Website" name="website" type="url"></ds-input>
                    </ds-fieldset>
                  </ds-stack>
                  <ds-stack slot="actions" direction="horizontal" gap="tight" justify="end">
                    <ds-button variant="secondary" label="Cancel" @press=${this.handleProfileCancel}></ds-button>
                    <ds-button variant="primary" type="submit" label="Save changes"></ds-button>
                  </ds-stack>
                </ds-form>
              </ds-tab-panel>

              <ds-tab-panel id="notifications">
                <ds-stack gap="loose">
                  <ds-fieldset legend="Email me about">
                    <ds-checkbox label="Product updates" description="About once a month."></ds-checkbox>
                    <ds-checkbox label="Security alerts" default-checked></ds-checkbox>
                    <ds-checkbox label="Tips and tutorials"></ds-checkbox>
                  </ds-fieldset>
                  <ds-fieldset legend="Push notifications">
                    <ds-switch
                      label="Enable push notifications"
                      .checked=${this.pushEnabled}
                      @change=${this.handlePushChange}
                    ></ds-switch>
                    <ds-radio-group
                      label="Frequency"
                      .options=${z}
                      default-value="immediately"
                      ?disabled=${!this.pushEnabled}
                    ></ds-radio-group>
                  </ds-fieldset>
                </ds-stack>
              </ds-tab-panel>

              <ds-tab-panel id="appearance">
                <ds-stack gap="loose">
                  <ds-fieldset legend="Theme">
                    <ds-segmented-control
                      label="Color mode"
                      .options=${B}
                      default-value="system"
                      @change=${this.handleColorModeChange}
                    ></ds-segmented-control>
                  </ds-fieldset>
                  <ds-fieldset legend="Density">
                    <ds-radio-group
                      label="Layout density"
                      .options=${V}
                      default-value="comfortable"
                      description="Affects tables and lists."
                    ></ds-radio-group>
                  </ds-fieldset>
                </ds-stack>
              </ds-tab-panel>

              <ds-tab-panel id="account">
                <ds-stack gap="loose">
                  <ds-card surface="subtle" inset="lg" heading="Export your data" heading-level="2">
                    <ds-stack gap="normal">
                      <ds-text>Download everything we store about you as a ZIP.</ds-text>
                      <ds-button variant="secondary" label="Request export"></ds-button>
                    </ds-stack>
                  </ds-card>
                  <ds-card surface="subtle" inset="lg" heading="Delete account" heading-level="2">
                    <ds-stack gap="normal">
                      <ds-alert tone="warning">This cannot be undone.</ds-alert>
                      <ds-button
                        variant="danger"
                        label="Delete account…"
                        @press=${this.handleDeleteRequest}
                      ></ds-button>
                    </ds-stack>
                  </ds-card>
                </ds-stack>
              </ds-tab-panel>
            </ds-tabs>
          </ds-stack>
        </ds-container>

        <ds-alert-dialog
          ?open=${this.deleteDialogOpen}
          heading="Delete your account?"
          description="This permanently deletes your account and everything in it. This cannot be undone."
          tone="danger"
          confirm-label="Delete account"
          @confirm=${this.handleDeleteConfirm}
          @cancel=${this.handleDeleteCancel}
        ></ds-alert-dialog>
      </ds-landmark>
    `}handleProfileSubmit=(L(this),e=>{new Promise(e=>setTimeout(e,300)).then(()=>{A({message:`Changes saved`})})});handleProfileCancel=()=>{(this.profileFormEl?.querySelectorAll(`ds-input`)??[]).forEach(e=>{e.value=void 0})};handlePushChange=e=>{this.pushEnabled=e.detail.checked};handleColorModeChange=e=>{e.detail.value===`dark`?document.documentElement.dataset.mode=`dark`:delete document.documentElement.dataset.mode};handleDeleteRequest=()=>{this.deleteDialogOpen=!0};handleDeleteConfirm=()=>{this.deleteDialogOpen=!1};handleDeleteCancel=e=>{this.deleteDialogOpen=!1}}];styles=t`
    :host {
      display: block;
    }
  `;constructor(){super(H),j()}}})))()}var W,G,K;function q(){return(q=e((()=>{i(),U(),W={title:`Patterns/SettingsPage`,parameters:{actions:{handles:[`submit`,`invalid`,`press`,`change`,`confirm`,`cancel`,`dismiss`]}},render:()=>u`<ds-pattern-settings-page></ds-pattern-settings-page>`},G={},K=[`Default`],G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{}`,...G.parameters?.docs?.source}}}})))()}q();export{G as Default,K as __namedExportsOrder,W as default};