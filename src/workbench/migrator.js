// migrator.js - Chrome 书签 AI 智能重构工作台主逻辑（支持网页会话免API模式与API直连双引擎、官方矢量图标、双栏可编辑树）

// 官方矢量 SVG 图标集合
const ICONS = {
  mimo: `<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px;margin-right:5px;flex-shrink:0;" fill="#FF6900"><path d="M12 0C8.016 0 4.756.255 2.493 2.516.23 4.776 0 8.033 0 12.012c0 3.98.23 7.235 2.494 9.497C4.757 23.77 8.017 24 12 24c3.983 0 7.243-.23 9.506-2.491C23.77 19.247 24 15.99 24 12.012c0-3.984-.233-7.243-2.502-9.504C19.234.252 15.978 0 12 0zM4.906 7.405h5.624c1.47 0 3.007.068 3.764.827.746.746.827 2.233.83 3.676v4.54a.15.15 0 0 1-.152.147h-1.947a.15.15 0 0 1-.152-.148V11.83c-.002-.806-.048-1.634-.464-2.051-.358-.36-1.026-.441-1.72-.458H7.158a.15.15 0 0 0-.151.147v6.98a.15.15 0 0 1-.152.148H4.906a.15.15 0 0 1-.15-.148V7.554a.15.15 0 0 1 .15-.149zm12.131 0h1.949a.15.15 0 0 1 .15.15v8.892a.15.15 0 0 1-.15.148h-1.949a.15.15 0 0 1-.151-.148V7.554a.15.15 0 0 1 .151-.149zM8.92 10.948h2.046c.083 0 .15.066.15.147v5.352a.15.15 0 0 1-.15.148H8.92a.15.15 0 0 1-.152-.148v-5.352a.15.15 0 0 1 .152-.147Z"/></svg>`,
  deepseek: `<svg height="14" style="vertical-align:-2px;margin-right:5px;flex-shrink:0;flex:none;line-height:1" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" fill="#4D6BFE"></path></svg>`,
  qwen: `<svg height="14" style="vertical-align:-2px;margin-right:5px;flex-shrink:0;flex:none;line-height:1" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M19.713 2.825h-5.907c0-.251-.066-.503-.196-.728L12.819.728A1.46 1.46 0 0 0 11.559 0h-1.58c-.52 0-1 .275-1.26.728l-2.42 4.19a1.45 1.45 0 0 0 0 1.453l.791 1.37c.26.448.74.727 1.26.727h11.36c.52 0 1-.275 1.26-.728l.79-1.37a1.45 1.45 0 0 0 0-1.451l-.79-1.37a1.46 1.46 0 0 0-1.26-.728zM.195 9.905l2.951 5.115a1.46 1.46 0 0 0-.531.531l-.791 1.37a1.45 1.45 0 0 0 0 1.452l.79 1.37c.26.448.74.727 1.26.727h4.84c.52 0 1-.275 1.26-.728l.79-1.37a1.45 1.45 0 0 0 0-1.451L5.086 7.083a1.46 1.46 0 0 0-1.26-.728h-1.58c-.52 0-1 .276-1.26.728l-.79 1.37a1.45 1.45 0 0 0 0 1.452m15.888 13.367 2.951-5.115c.217.125.469.196.728.196h1.582c.52 0 1-.275 1.26-.728l.79-1.37a1.45 1.45 0 0 0 0-1.451l-2.42-4.191a1.46 1.46 0 0 0-1.259-.728h-1.582c-.52 0-1 .276-1.259.728l-5.678 9.838a1.45 1.45 0 0 0 0 1.452l.79 1.37c.26.448.74.727 1.26.727h1.582c.52 0 1-.275 1.26-.728z" fill="#082dff"></path></svg>`,
  zhipu: `<svg height="14" style="vertical-align:-2px;margin-right:5px;flex-shrink:0;flex:none;line-height:1" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M11.991 23.503a.24.24 0 00-.244.248.24.24 0 00.244.249.24.24 0 00.245-.249.24.24 0 00-.22-.247l-.025-.001zM9.671 5.365a1.697 1.697 0 011.099 2.132l-.071.172-.016.04-.018.054c-.07.16-.104.32-.104.498-.035.71.47 1.279 1.186 1.314h.366c1.309.053 2.338 1.173 2.286 2.523-.052 1.332-1.152 2.38-2.478 2.327h-.174c-.715.018-1.274.64-1.239 1.368 0 .124.018.23.053.337.209.373.54.658.96.8.75.23 1.517-.125 1.9-.782l.018-.035c.402-.64 1.17-.96 1.92-.711.854.284 1.378 1.226 1.099 2.167a1.661 1.661 0 01-2.077 1.102 1.711 1.711 0 01-.907-.711l-.017-.035c-.2-.323-.463-.58-.851-.711l-.056-.018a1.646 1.646 0 00-1.954.746 1.66 1.66 0 01-1.065.764 1.677 1.677 0 01-1.989-1.279c-.209-.906.332-1.83 1.257-2.043a1.51 1.51 0 01.296-.035h.018c.68-.071 1.151-.622 1.116-1.333a1.307 1.307 0 00-.227-.693 2.515 2.515 0 01-.366-1.403 2.39 2.39 0 01.366-1.208c.14-.195.21-.444.227-.693.018-.71-.506-1.261-1.186-1.332l-.07-.018a1.43 1.43 0 01-.299-.07l-.05-.019a1.7 1.7 0 01-1.047-2.114 1.68 1.68 0 012.094-1.101zm-5.575 10.11c.26-.264.639-.367.994-.27.355.096.633.379.728.74.095.362-.007.748-.267 1.013-.402.41-1.053.41-1.455 0a1.062 1.062 0 010-1.482zm14.845-.294c.359-.09.738.024.992.297.254.274.344.665.237 1.025-.107.36-.396.634-.756.718-.551.128-1.1-.22-1.23-.781a1.05 1.05 0 01.757-1.26zm-.064-4.39c.314.32.49.753.49 1.206 0 .452-.176.886-.49 1.206-.315.32-.74.5-1.185.5-.444 0-.87-.18-1.184-.5a1.727 1.727 0 010-2.412 1.654 1.654 0 012.369 0zm-11.243.163c.364.484.447 1.128.218 1.691a1.665 1.665 0 01-2.188.923c-.855-.36-1.26-1.358-.907-2.228a1.68 1.68 0 011.33-1.038c.593-.08 1.183.169 1.547.652zm11.545-4.221c.368 0 .708.2.892.524.184.324.184.724 0 1.048a1.026 1.026 0 01-.892.524c-.568 0-1.03-.47-1.03-1.048 0-.579.462-1.048 1.03-1.048zm-14.358 0c.368 0 .707.2.891.524.184.324.184.724 0 1.048a1.026 1.026 0 01-.891.524c-.569 0-1.03-.47-1.03-1.048 0-.579.461-1.048 1.03-1.048zm10.031-1.475c.925 0 1.675.764 1.675 1.706s-.75 1.705-1.675 1.705-1.674-.763-1.674-1.705c0-.942.75-1.706 1.674-1.706zm-2.626-.684c.362-.082.653-.356.761-.718a1.062 1.062 0 00-.238-1.028 1.017 1.017 0 00-.996-.294c-.547.14-.881.7-.752 1.257.13.558.675.907 1.225.783zm0 16.876c.359-.087.644-.36.75-.72a1.062 1.062 0 00-.237-1.019 1.018 1.018 0 00-.985-.301 1.037 1.037 0 00-.762.717c-.108.361-.017.754.239 1.028.245.263.606.377.953.305l.043-.01zM17.19 3.5a.631.631 0 00.628-.64c0-.355-.279-.64-.628-.64a.631.631 0 00-.628.64c0 .355.28.64.628.64zm-10.38 0a.631.631 0 00.628-.64c0-.355-.28-.64-.628-.64a.631.631 0 00-.628.64c0 .355.279.64.628.64zm-5.182 7.852a.631.631 0 00-.628.64c0 .354.28.639.628.639a.63.63 0 00.627-.606l.001-.034a.62.62 0 00-.628-.64zm5.182 9.13a.631.631 0 00-.628.64c0 .355.279.64.628.64a.631.631 0 00.628-.64c0-.355-.28-.64-.628-.64zm10.38.018a.631.631 0 00-.628.64c0 .355.28.64.628.64a.631.631 0 00.628-.64c0-.355-.279-.64-.628-.64zm5.182-9.148a.631.631 0 00-.628.64c0 .354.279.639.628.639a.631.631 0 00.628-.64c0-.355-.28-.64-.628-.64zm-.384-4.992a.24.24 0 00.244-.249.24.24 0 00-.244-.249.24.24 0 00-.244.249c0 .142.122.249.244.249zM11.991.497a.24.24 0 00.245-.248A.24.24 0 0011.99 0a.24.24 0 00-.244.249c0 .133.108.236.223.247l.021.001zM2.011 6.36a.24.24 0 00.245-.249.24.24 0 00-.244-.249.24.24 0 00-.244.249.24.24 0 00.244.249zm0 11.263a.24.24 0 00-.243.248.24.24 0 00.244.249.24.24 0 00.244-.249.252.252 0 00-.244-.248zm19.995-.018a.24.24 0 00-.245.248.24.24 0 00.245.25.24.24 0 00.244-.25.252.252 0 00-.244-.248z" fill="#3859FF" fill-rule="nonzero"></path></svg>`,
  kimi: `<svg fill="currentColor" fill-rule="evenodd" height="14" style="vertical-align:-2px;margin-right:5px;flex-shrink:0;flex:none;line-height:1" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M1.052 16.916l9.539 2.552a21.007 21.007 0 00.06 2.033l5.956 1.593a11.997 11.997 0 01-5.586.865l-.18-.016-.044-.004-.084-.009-.094-.01a11.605 11.605 0 01-.157-.02l-.107-.014-.11-.016a11.962 11.962 0 01-.32-.051l-.042-.008-.075-.013-.107-.02-.07-.015-.093-.019-.075-.016-.095-.02-.097-.023-.094-.022-.068-.017-.088-.022-.09-.024-.095-.025-.082-.023-.109-.03-.062-.02-.084-.025-.093-.028-.105-.034-.058-.019-.08-.026-.09-.031-.066-.024a6.293 6.293 0 01-.044-.015l-.068-.025-.101-.037-.057-.022-.08-.03-.087-.035-.088-.035-.079-.032-.095-.04-.063-.028-.063-.027a5.655 5.655 0 01-.041-.018l-.066-.03-.103-.047-.052-.024-.096-.046-.062-.03-.084-.04-.086-.044-.093-.047-.052-.027-.103-.055-.057-.03-.058-.032a6.49 6.49 0 01-.046-.026l-.094-.053-.06-.034-.051-.03-.072-.041-.082-.05-.093-.056-.052-.032-.084-.053-.061-.039-.079-.05-.07-.047-.053-.035a7.785 7.785 0 01-.054-.036l-.044-.03-.044-.03a6.066 6.066 0 01-.04-.028l-.057-.04-.076-.054-.069-.05-.074-.054-.056-.042-.076-.057-.076-.059-.086-.067-.045-.035-.064-.052-.074-.06-.089-.073-.046-.039-.046-.039a7.516 7.516 0 01-.043-.037l-.045-.04-.061-.053-.07-.062-.068-.06-.062-.058-.067-.062-.053-.05-.088-.084a13.28 13.28 0 01-.099-.097l-.029-.028-.041-.042-.069-.07-.05-.051-.05-.053a6.457 6.457 0 01-.168-.179l-.08-.088-.062-.07-.071-.08-.042-.049-.053-.062-.058-.068-.046-.056a7.175 7.175 0 01-.027-.033l-.045-.055-.066-.082-.041-.052-.05-.064-.02-.025a11.99 11.99 0 01-1.44-2.402zm-1.02-5.794l11.353 3.037a20.468 20.468 0 00-.469 2.011l10.817 2.894a12.076 12.076 0 01-1.845 2.005L.657 15.923l-.016-.046-.035-.104a11.965 11.965 0 01-.05-.153l-.007-.023a11.896 11.896 0 01-.207-.741l-.03-.126-.018-.08-.021-.097-.018-.081-.018-.09-.017-.084-.018-.094c-.026-.141-.05-.283-.071-.426l-.017-.118-.011-.083-.013-.102a12.01 12.01 0 01-.019-.161l-.005-.047a12.12 12.12 0 01-.034-2.145zm1.593-5.15l11.948 3.196c-.368.605-.705 1.231-1.01 1.875l11.295 3.022c-.142.82-.368 1.612-.668 2.365l-11.55-3.09L.124 10.26l.015-.1.008-.049.01-.067.015-.087.018-.098c.026-.148.056-.295.088-.442l.028-.124.02-.085.024-.097c.022-.09.045-.18.07-.268l.028-.102.023-.083.03-.1.025-.082.03-.096.026-.082.031-.095a11.896 11.896 0 011.01-2.232zm4.442-4.4L17.352 4.59a20.77 20.77 0 00-1.688 1.721l7.823 2.093c.267.852.442 1.744.513 2.665L2.106 5.213l.045-.065.027-.04.04-.055.046-.065.055-.076.054-.072.064-.086.05-.065.057-.073.055-.07.06-.074.055-.069.065-.077.054-.066.066-.077.053-.06.072-.082.053-.06.067-.074.054-.058.073-.078.058-.06.063-.067.168-.17.1-.098.059-.056.076-.071a12.084 12.084 0 012.272-1.677zM12.017 0h.097l.082.001.069.001.054.002.068.002.046.001.076.003.047.002.06.003.054.002.087.005.105.007.144.011.088.007.044.004.077.008.082.008.047.005.102.012.05.006.108.014.081.01.042.006.065.01.207.032.07.012.065.011.14.026.092.018.11.022.046.01.075.016.041.01L14.7.3l.042.01.065.015.049.012.071.017.096.024.112.03.113.03.113.032.05.015.07.02.078.024.073.023.05.016.05.016.076.025.099.033.102.036.048.017.064.023.093.034.11.041.116.045.1.04.047.02.06.024.041.018.063.026.04.018.057.025.11.048.1.046.074.035.075.036.06.028.092.046.091.045.102.052.053.028.049.026.046.024.06.033.041.022.052.029.088.05.106.06.087.051.057.034.053.032.096.059.088.055.098.062.036.024.064.041.084.056.04.027.062.042.062.043.023.017c.054.037.108.075.161.114l.083.06.065.048.056.043.086.065.082.064.04.03.05.041.086.069.079.065.085.071c.712.6 1.353 1.283 1.909 2.031L7.222.994l.062-.027.065-.028.081-.034.086-.035c.113-.045.227-.09.341-.131l.096-.035.093-.033.084-.03.096-.031c.087-.03.176-.058.264-.085l.091-.027.086-.025.102-.03.085-.023.1-.026L9.04.37l.09-.023.091-.022.095-.022.09-.02.098-.021.091-.02.095-.018.092-.018.1-.018.091-.016.098-.017.092-.014.097-.015.092-.013.102-.013.091-.012.105-.012.09-.01.105-.01c.093-.01.186-.018.28-.024l.106-.008.09-.005.11-.006.093-.004.1-.004.097-.002.099-.002.197-.002z"></path></svg>`,
  doubao: `<svg height="14" style="vertical-align:-2px;margin-right:5px;flex-shrink:0;flex:none;line-height:1" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M5.31 15.756c.172-3.75 1.883-5.999 2.549-6.739-3.26 2.058-5.425 5.658-6.358 8.308v1.12C1.501 21.513 4.226 24 7.59 24a6.59 6.59 0 002.2-.375c.353-.12.7-.248 1.039-.378.913-.899 1.65-1.91 2.243-2.992-4.877 2.431-7.974.072-7.763-4.5l.002.001z" fill="#1E37FC"></path><path d="M22.57 10.283c-1.212-.901-4.109-2.404-7.397-2.8.295 3.792.093 8.766-2.1 12.773a12.782 12.782 0 01-2.244 2.992c3.764-1.448 6.746-3.457 8.596-5.219 2.82-2.683 3.353-5.178 3.361-6.66a2.737 2.737 0 00-.216-1.084v-.002z" fill="#37E1BE"></path><path d="M14.303 1.867C12.955.7 11.248 0 9.39 0 7.532 0 5.883.677 4.545 1.807 2.791 3.29 1.627 5.557 1.5 8.125v9.201c.932-2.65 3.097-6.25 6.357-8.307.5-.318 1.025-.595 1.569-.829 1.883-.801 3.878-.932 5.746-.706-.222-2.83-.718-5.002-.87-5.617h.001z" fill="#A569FF"></path><path d="M17.305 4.961a199.47 199.47 0 01-1.08-1.094c-.202-.213-.398-.419-.586-.622l-1.333-1.378c.151.615.648 2.786.869 5.617 3.288.395 6.185 1.898 7.396 2.8-1.306-1.275-3.475-3.487-5.266-5.323z" fill="#1E37FC"></path></svg>`,
  openai: `<svg fill="currentColor" fill-rule="evenodd" height="14" style="vertical-align:-2px;margin-right:5px;flex-shrink:0;flex:none;line-height:1" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"></path></svg>`,
  openrouter: `<svg height="14" style="vertical-align:-2px;margin-right:5px;flex-shrink:0;flex:none;line-height:1" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M18.654 3.87a5.087 5.087 0 110 10.174L23.7 19.09c.64.641.187 1.737-.72 1.737H8.48a8.479 8.479 0 010-16.958h10.175zM8.479 7.26a5.087 5.087 0 100 10.176 5.087 5.087 0 000-10.175z" fill="#C8FF00"></path></svg>`,
  ollama: `<svg fill="currentColor" fill-rule="evenodd" height="14" style="vertical-align:-2px;margin-right:5px;flex-shrink:0;flex:none;line-height:1" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M7.905 1.09c.216.085.411.225.588.41.295.306.544.744.734 1.263.191.522.315 1.1.362 1.68a5.054 5.054 0 012.049-.636l.051-.004c.87-.07 1.73.087 2.48.474.101.053.2.11.297.17.05-.569.172-1.134.36-1.644.19-.52.439-.957.733-1.264a1.67 1.67 0 01.589-.41c.257-.1.53-.118.796-.042.401.114.745.368 1.016.737.248.337.434.769.561 1.287.23.934.27 2.163.115 3.645l.053.04.026.019c.757.576 1.284 1.397 1.563 2.35.435 1.487.216 3.155-.534 4.088l-.018.021.002.003c.417.762.67 1.567.724 2.4l.002.03c.064 1.065-.2 2.137-.814 3.19l-.007.01.01.024c.472 1.157.62 2.322.438 3.486l-.006.039a.651.651 0 01-.747.536.648.648 0 01-.54-.742c.167-1.033.01-2.069-.48-3.123a.643.643 0 01.04-.617l.004-.006c.604-.924.854-1.83.8-2.72-.046-.779-.325-1.544-.8-2.273a.644.644 0 01.18-.886l.009-.006c.243-.159.467-.565.58-1.12a4.229 4.229 0 00-.095-1.974c-.205-.7-.58-1.284-1.105-1.683-.595-.454-1.383-.673-2.38-.61a.653.653 0 01-.632-.371c-.314-.665-.772-1.141-1.343-1.436a3.288 3.288 0 00-1.772-.332c-1.245.099-2.343.801-2.67 1.686a.652.652 0 01-.61.425c-1.067.002-1.893.252-2.497.703-.522.39-.878.935-1.066 1.588a4.07 4.07 0 00-.068 1.886c.112.558.331 1.02.582 1.269l.008.007c.212.207.257.53.109.785-.36.622-.629 1.549-.673 2.44-.05 1.018.186 1.902.719 2.536l.016.019a.643.643 0 01.095.69c-.576 1.236-.753 2.252-.562 3.052a.652.652 0 01-1.269.298c-.243-1.018-.078-2.184.473-3.498l.014-.035-.008-.012a4.339 4.339 0 01-.598-1.309l-.005-.019a5.764 5.764 0 01-.177-1.785c.044-.91.278-1.842.622-2.59l.012-.026-.002-.002c-.293-.418-.51-.953-.63-1.545l-.005-.024a5.352 5.352 0 01.093-2.49c.262-.915.777-1.701 1.536-2.269.06-.045.123-.09.186-.132-.159-1.493-.119-2.73.112-3.67.127-.518.314-.95.562-1.287.27-.368.614-.622 1.015-.737.266-.076.54-.059.797.042zm4.116 9.09c.936 0 1.8.313 2.446.855.63.527 1.005 1.235 1.005 1.94 0 .888-.406 1.58-1.133 2.022-.62.375-1.451.557-2.403.557-1.009 0-1.871-.259-2.493-.734-.617-.47-.963-1.13-.963-1.845 0-.707.398-1.417 1.056-1.946.668-.537 1.55-.849 2.485-.849zm0 .896a3.07 3.07 0 00-1.916.65c-.461.37-.722.835-.722 1.25 0 .428.21.829.61 1.134.455.347 1.124.548 1.943.548.799 0 1.473-.147 1.932-.426.463-.28.7-.686.7-1.257 0-.423-.246-.89-.683-1.256-.484-.405-1.14-.643-1.864-.643zm.662 1.21l.004.004c.12.151.095.37-.056.49l-.292.23v.446a.375.375 0 01-.376.373.375.375 0 01-.376-.373v-.46l-.271-.218a.347.347 0 01-.052-.49.353.353 0 01.494-.051l.215.172.22-.174a.353.353 0 01.49.051zm-5.04-1.919c.478 0 .867.39.867.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zm8.706 0c.48 0 .868.39.868.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zM7.44 2.3l-.003.002a.659.659 0 00-.285.238l-.005.006c-.138.189-.258.467-.348.832-.17.692-.216 1.631-.124 2.782.43-.128.899-.208 1.404-.237l.01-.001.019-.034c.046-.082.095-.161.148-.239.123-.771.022-1.692-.253-2.444-.134-.364-.297-.65-.453-.813a.628.628 0 00-.107-.09L7.44 2.3zm9.174.04l-.002.001a.628.628 0 00-.107.09c-.156.163-.32.45-.453.814-.29.794-.387 1.776-.23 2.572l.058.097.008.014h.03a5.184 5.184 0 011.466.212c.086-1.124.038-2.043-.128-2.722-.09-.365-.21-.643-.349-.832l-.004-.006a.659.659 0 00-.285-.239h-.004z"></path></svg>`,
  local_gateway: `<svg fill="currentColor" fill-rule="evenodd" height="14" style="vertical-align:-2px;margin-right:5px;flex-shrink:0;flex:none;line-height:1" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M2.84 2a1.273 1.273 0 100 2.547h14.107a1.273 1.273 0 100-2.547H2.84zM7.935 5.33a1.273 1.273 0 000 2.548H22.04a1.274 1.274 0 000-2.547H7.935zM3.624 9.935c0-.704.57-1.274 1.274-1.274h14.106a1.274 1.274 0 010 2.547H4.898c-.703 0-1.274-.57-1.274-1.273zM1.273 12.188a1.273 1.273 0 100 2.547H15.38a1.274 1.274 0 000-2.547H1.273zM3.624 16.792c0-.704.57-1.274 1.274-1.274h14.106a1.273 1.273 0 110 2.547H4.898c-.703 0-1.274-.57-1.274-1.273zM13.029 18.849a1.273 1.273 0 100 2.547h9.698a1.273 1.273 0 100-2.547h-9.698z" fill-opacity=".3"></path><path d="M2.84 2a1.273 1.273 0 100 2.547h10.287a1.274 1.274 0 000-2.547H2.84zM7.935 5.33a1.273 1.273 0 000 2.548H18.22a1.274 1.274 0 000-2.547H7.935zM3.624 9.935c0-.704.57-1.274 1.274-1.274h10.286a1.273 1.273 0 010 2.547H4.898c-.703 0-1.274-.57-1.274-1.273zM1.273 12.188a1.273 1.273 0 100 2.547H11.56a1.274 1.274 0 000-2.547H1.273zM3.624 16.792c0-.704.57-1.274 1.274-1.274h10.286a1.273 1.273 0 110 2.547H4.898c-.703 0-1.274-.57-1.274-1.273zM13.029 18.849a1.273 1.273 0 100 2.547h5.78a1.273 1.273 0 100-2.547h-5.78z"></path></svg>`,
};

// DOM 元素引用
const dom = {
  // 导航与状态指示
  tabs: document.querySelectorAll(".nav-tab"),
  tabContents: document.querySelectorAll(".tab-content"),
  connDot: document.getElementById("connDot"),
  connLabel: document.getElementById("connLabel"),
  versionBadge: document.getElementById("versionBadge"),

  // 引擎模式切换
  btnModeWeb: document.getElementById("btnModeWeb"),
  btnModeApi: document.getElementById("btnModeApi"),
  panelWebConfig: document.getElementById("panelWebConfig"),
  panelApiConfig: document.getElementById("panelApiConfig"),

  // 网页会话配置
  btnOpenWebTab: document.getElementById("btnOpenWebTab"),
  btnPingBridge: document.getElementById("btnPingBridge"),
  cardWebDeepSeek: document.getElementById("cardWebDeepSeek"),
  cardWebChatGPT: document.getElementById("cardWebChatGPT"),
  statusWebDeepSeek: document.getElementById("statusWebDeepSeek"),
  statusWebChatGPT: document.getElementById("statusWebChatGPT"),
  webBatchSize: document.getElementById("webBatchSize"),
  webWaitTimeout: document.getElementById("webWaitTimeout"),

  // API 接口配置面板
  cfgBaseUrl: document.getElementById("cfgBaseUrl"),
  providerTagsContainer: document.getElementById("providerTagsContainer"),
  cfgApiKey: document.getElementById("cfgApiKey"),
  toggleKeyBtn: document.getElementById("toggleKeyBtn"),
  cfgModel: document.getElementById("cfgModel"),
  modelTagsContainer: document.getElementById("modelTagsContainer"),
  cfgBatchSize: document.getElementById("cfgBatchSize"),
  cfgTemperature: document.getElementById("cfgTemperature"),
  cfgJsonMode: document.getElementById("cfgJsonMode"),
  testConnBtn: document.getElementById("testConnBtn"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  resetSettingsBtn: document.getElementById("resetSettingsBtn"),
  testResultMsg: document.getElementById("testResultMsg"),

  // 提示词面板
  presetSelect: document.getElementById("presetSelect"),
  promptSystem: document.getElementById("promptSystem"),
  promptUser: document.getElementById("promptUser"),
  savePromptBtn: document.getElementById("savePromptBtn"),
  resetPresetBtn: document.getElementById("resetPresetBtn"),
  promptStatusMsg: document.getElementById("promptStatusMsg"),

  // 工作台总控
  workbenchEngineBadge: document.getElementById("workbenchEngineBadge"),
  scopeFolderSelect: document.getElementById("scopeFolderSelect"),
  scanBtn: document.getElementById("scanBtn"),
  startAiBtn: document.getElementById("startAiBtn"),
  stopAiBtn: document.getElementById("stopAiBtn"),
  backupBtn: document.getElementById("backupBtn"),
  applyChangesBtn: document.getElementById("applyChangesBtn"),
  btnGrabWebReply: document.getElementById("btnGrabWebReply"),
  btnCopyCurrentPrompt: document.getElementById("btnCopyCurrentPrompt"),
  btnPasteWebReply: document.getElementById("btnPasteWebReply"),
  workbenchProgress: document.getElementById("workbenchProgress"),
  workbenchStatusText: document.getElementById("workbenchStatusText"),
  batchProgressText: document.getElementById("batchProgressText"),

  // 统计指标
  stTotalScanned: document.getElementById("stTotalScanned"),
  stProposed: document.getElementById("stProposed"),
  stMoves: document.getElementById("stMoves"),
  stRenames: document.getElementById("stRenames"),
  stUrlFixes: document.getElementById("stUrlFixes"),
  stSelected: document.getElementById("stSelected"),

  // Token 与成本计算
  tokTotalBadge: document.getElementById("tokTotalBadge"),
  tokPrompt: document.getElementById("tokPrompt"),
  tokCompletion: document.getElementById("tokCompletion"),
  tokCached: document.getElementById("tokCached"),
  tokCost: document.getElementById("tokCost"),
  priceInputRate: document.getElementById("priceInputRate"),
  priceOutputRate: document.getElementById("priceOutputRate"),
  priceCacheRate: document.getElementById("priceCacheRate"),
  priceCurrency: document.getElementById("priceCurrency"),

  // 视图切换与双栏树
  btnViewTable: document.getElementById("btnViewTable"),
  btnViewTree: document.getElementById("btnViewTree"),
  diffTableViewContainer: document.getElementById("diffTableViewContainer"),
  diffTreeViewContainer: document.getElementById("diffTreeViewContainer"),
  treeSearchInput: document.getElementById("treeSearchInput"),
  btnExpandAllTrees: document.getElementById("btnExpandAllTrees"),
  btnCollapseAllTrees: document.getElementById("btnCollapseAllTrees"),
  origTreeContent: document.getElementById("origTreeContent"),
  propTreeContent: document.getElementById("propTreeContent"),
  origTreeCount: document.getElementById("origTreeCount"),
  propTreeCount: document.getElementById("propTreeCount"),
  folderPathDatalist: document.getElementById("folderPathDatalist"),

  // 账本与过滤
  filterChips: document.querySelectorAll(".filter-chip"),
  btnSelectAll: document.getElementById("btnSelectAll"),
  btnDeselectAll: document.getElementById("btnDeselectAll"),
  btnSelectChangedOnly: document.getElementById("btnSelectChangedOnly"),
  masterCheckbox: document.getElementById("masterCheckbox"),
  diffTableBody: document.getElementById("diffTableBody"),
  cntAll: document.getElementById("cntAll"),
  cntChanged: document.getElementById("cntChanged"),
  cntUrlFix: document.getElementById("cntUrlFix"),
  cntMove: document.getElementById("cntMove"),
  cntRename: document.getElementById("cntRename"),
  cntDelete: document.getElementById("cntDelete"),

  // 日志
  logBox: document.getElementById("logBox"),
  copyLogBtn: document.getElementById("copyLogBtn"),
  clearLogBtn: document.getElementById("clearLogBtn"),
};

// 常见 API 厂商预设（含官方矢量 SVG 图标）
const AI_PROVIDERS = [
  {
    id: "mimo",
    name: "小米 MiMo",
    iconKey: "mimo",
    category: "国内主流",
    baseUrl: "https://api.xiaomimimo.com/v1",
    defaultModel: "mimo-v2.6-flash",
    models: ["mimo-v2.6-flash", "mimo-v2.6-pro", "mimo-v2.6-pro-ultraspeed"],
  },
  {
    id: "deepseek",
    name: "DeepSeek 官方",
    iconKey: "deepseek",
    category: "国内主流",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    models: ["deepseek-chat", "deepseek-reasoner"],
  },
  {
    id: "dashscope",
    name: "阿里百炼 (通义千问)",
    iconKey: "qwen",
    category: "国内主流",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-plus",
    models: ["qwen-plus", "qwen-flash", "qwen-turbo", "qwen-max"],
  },
  {
    id: "zhipu",
    name: "智谱 AI (GLM)",
    iconKey: "zhipu",
    category: "国内主流",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "glm-4-flash",
    models: ["glm-4-flash", "glm-4-plus", "glm-4-air"],
  },
  {
    id: "moonshot",
    name: "月之暗面 (Kimi)",
    iconKey: "kimi",
    category: "国内主流",
    baseUrl: "https://api.moonshot.cn/v1",
    defaultModel: "moonshot-v1-8k",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
  },
  {
    id: "volcengine",
    name: "火山引擎 (豆包)",
    iconKey: "doubao",
    category: "国内主流",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    defaultModel: "doubao-pro-32k",
    models: ["doubao-pro-32k", "doubao-lite-32k"],
  },
  {
    id: "openai",
    name: "OpenAI 官方",
    iconKey: "openai",
    category: "国际与聚合",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o-mini", "gpt-4o", "o3-mini"],
  },
  {
    id: "openrouter",
    name: "OpenRouter 聚合",
    iconKey: "openrouter",
    category: "国际与聚合",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "deepseek/deepseek-chat",
    models: ["deepseek/deepseek-chat", "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.3-70b-instruct"],
  },
  {
    id: "ollama",
    name: "Ollama 本地",
    iconKey: "ollama",
    category: "本地与私有",
    baseUrl: "http://localhost:11434/v1",
    defaultModel: "qwen2.5:7b",
    models: ["qwen2.5:7b", "deepseek-r1:8b", "llama3.2:3b"],
  },
  {
    id: "local_gateway",
    name: "LM Studio / vLLM",
    iconKey: "local_gateway",
    category: "本地与私有",
    baseUrl: "http://localhost:1234/v1",
    defaultModel: "local-model",
    models: ["local-model"],
  },
];

// 通用专业书签治理提示词库
const PRESETS = {
  deep_refactor: {
    name: "🚀 深度规范重构（标题净化 + 智能归类 + 路由纠偏）",
    system:
      "你是一位严谨的现代知识管理与书签架构专家。你的职责是对技术、学术及日常生产力书签进行高质量、结构化的深度治理。\n\n" +
      "核心治理原则：\n" +
      "1. 【标题极简去噪（Anti-Slop）】：\n" +
      "   - 彻底剥离网站常见的营销与平台商业后缀（例如：_哔哩哔哩_bilibili、- 掘金、- CSDN博客、- 知乎、- 简书、官网、首页、官方正版、最新等）及冗余广告修饰；\n" +
      "   - 仅保留清晰、精准、易检索的产品名、开源项目名、文档手册标题或核心知识主题；\n" +
      "   - 严谨保留专有名词的原生英文大小写与技术代号（如 GitHub、Docker、PyTorch、Vue 等）；遇到重大官方更名可采用「现用名 (原名)」形式；\n\n" +
      "2. 【自适应目录归位（Adaptive Taxonomy）】：\n" +
      "   - 仔细研读用户当前的目录层级列表（{{FOLDER_TREE}}），将书签精准分流到最贴切的既有分类中；\n" +
      "   - 优先就近复用既有文件夹，不凭空捏造无序同义目录；确有必要时允许扩充符合当前整体风格的清晰子目录；\n\n" +
      "3. 【实证路由纠偏（Anti-Rot）】：\n" +
      "   - 若识别出书签包含已被官方废弃、重命名或重定向的旧域名/旧接口（例如常见文档主站升级、官方迁移新域名），在 new_url 中给出最新的正规官方链接；无变动则保持为空；\n\n" +
      "4. 【审慎保护原则（Chesterton's Fence）】：\n" +
      "   - 遇到已停止服务或暂时无法访问的链接，绝不盲目物理删除；建议将目标目录设为对应层级下的「归档」或「过期」子目录，并在标题末尾标注「(已停服/已归档)」；仅对毫无留存价值的纯垃圾广告或完全无效链接才标记为 delete。\n\n" +
      "输出契约：必须严格返回合法 JSON 对象，不包含任何外部 Markdown 解释或多余闲聊。",
    user:
      "【当前现存目录体系参考】：\n{{FOLDER_TREE}}\n\n" +
      "【待处理书签批次】：\n{{BOOKMARK_LIST}}\n\n" +
      "请按照以下严格 JSON 结构返回治理决策：\n" +
      "{\n" +
      '  "operations": [\n' +
      "    {\n" +
      '      "id": "书签ID",\n' +
      '      "action": "update", // "update" (修改/移动/纠偏) | "keep" (保持现状) | "delete" (彻底删除死链)\n' +
      '      "new_title": "精简净化后的标题（无改动留空或保持原样）",\n' +
      '      "new_url": "纠偏后的官方新地址（无迁移留空或保持原样）",\n' +
      '      "target_path": "建议目标完整目录（无移动留空或保持原样）",\n' +
      '      "reason": "简述决策理由（例如：去除商业尾巴 / 归入开发工具 / 域名迁移纠偏）"\n' +
      "    }\n" +
      "  ]\n" +
      "}",
  },
  categorize: {
    name: "📁 自适应目录归纳（保持标题与链接不变）",
    system:
      "你是一位资深的书签与知识库架构专家。你的任务是对用户给出的书签进行精准分类归档。\n" +
      "请仔细阅读已有的目录树结构（{{FOLDER_TREE}}），将每个书签分流至最符合其主题的既有目录层级中。\n" +
      "规则：\n" +
      "1. 优先复用已有目录；确有必要时允许建议新建风格统一的标准子目录；\n" +
      "2. 保持标题与 URL 不变，仅调整 target_path；若当前目录已完全合理，action 设为 'keep'；\n" +
      "3. 严禁丢失书签 id，必须返回合法 JSON 格式。",
    user:
      "【当前目录树结构】：\n{{FOLDER_TREE}}\n\n" +
      "【待归类书签列表】：\n{{BOOKMARK_LIST}}\n\n" +
      "请按照如下严格 JSON 结构返回：\n" +
      "{\n" +
      '  "operations": [\n' +
      "    {\n" +
      '      "id": "书签ID",\n' +
      '      "action": "update", // "update" 或 "keep"\n' +
      '      "target_path": "建议目标完整目录路径",\n' +
      '      "reason": "简要分类依据"\n' +
      "    }\n" +
      "  ]\n" +
      "}",
  },
  title_clean: {
    name: "✨ 标题极简去噪（保持目录与链接不变）",
    system:
      "你是一位严谨的技术文档与知识整理助手。你的任务是净化书签标题。\n" +
      "去除标题中冗余的网站后缀、SEO广告词，保留干净的核心产品名或文章核心主题，保持目录与 URL 完全不变。\n" +
      "必须输出严格 JSON 格式。",
    user:
      "【待净化书签列表】：\n{{BOOKMARK_LIST}}\n\n" +
      "请按照如下结构返回 JSON：\n" +
      "{\n" +
      '  "operations": [\n' +
      "    {\n" +
      '      "id": "书签ID",\n' +
      '      "action": "update",\n' +
      '      "new_title": "极简化后的新标题",\n' +
      '      "reason": "去噪说明"\n' +
      "    }\n" +
      "  ]\n" +
      "}",
  },
  audit_rot: {
    name: "🧹 失效迁移与冗余审查（专项健康体检）",
    system:
      "你是一位资深的网络资源健康审计助手。识别已知已更名、已失效或迁移新域名的常见技术网站，在 new_url 中纠偏。\n" +
      "严重失效或停服网站建议移入「归档」目录并在标题注明，完全垃圾广告链接建议 action: 'delete'。\n" +
      "必须返回标准 JSON。",
    user:
      "【待审计书签列表】：\n{{BOOKMARK_LIST}}\n\n" +
      "请返回如下结构 JSON：\n" +
      "{\n" +
      '  "operations": [\n' +
      "    {\n" +
      '      "id": "书签ID",\n' +
      '      "action": "update", // update | delete | keep\n' +
      '      "new_url": "纠偏地址",\n' +
      '      "target_path": "目标目录",\n' +
      '      "reason": "审计说明"\n' +
      "    }\n" +
      "  ]\n" +
      "}",
  },
  custom: {
    name: "🛠️ 自由专家模式 (Custom)",
    system: "你是一位专业书签整理助手。请按照用户要求对书签进行治理并返回合法 JSON。",
    user: "{{FOLDER_TREE}}\n\n{{BOOKMARK_LIST}}",
  },
};

// 全局运行时状态
const state = {
  engineMode: "web_session", // "web_session" (默认免 API) 或 "api"
  webProvider: "deepseek",   // "deepseek" 或 "chatgpt"
  webTabId: null,
  config: {
    baseUrl: "https://api.xiaomimimo.com/v1",
    apiKey: "",
    model: "mimo-v2.6-flash",
    batchSize: 20,
    temperature: 0.2,
    jsonMode: true,
    currentPreset: "deep_refactor",
    prompts: {},
  },
  tokens: {
    prompt: 0,
    completion: 0,
    cached: 0,
    total: 0,
  },
  pricing: {
    inputRate: 0.5,
    outputRate: 1.5,
    cacheRate: 0.1,
    currency: "¥",
  },
  barNode: null,
  scopeRoots: [],
  allUrlNodes: [],
  folderMap: new Map(),
  scannedItems: [], // 当前作用域下的所有书签
  ledgerItems: [],  // 差异变更账本条目
  currentFilter: "all",
  activeDiffView: "table", // "table" 或 "tree"
  collapsedFolders: new Set(),
  editingItemId: null,
  treeSearchKeyword: "",
  isAnalyzing: false,
  abortController: null,
};

// ================= 日志与工具函数 =================

function log(msg, level = "info") {
  const prefix = level === "ok" ? "[OK] " : level === "warn" ? "[WARN] " : level === "err" ? "[ERR] " : "[INFO] ";
  dom.logBox.textContent += `${prefix}${msg}\n`;
  dom.logBox.scrollTop = dom.logBox.scrollHeight;
}

function setProgress(pct, statusText, batchText) {
  dom.workbenchProgress.style.width = `${Math.min(100, Math.max(0, pct)).toFixed(1)}%`;
  if (statusText) dom.workbenchStatusText.textContent = statusText;
  if (batchText !== undefined) dom.batchProgressText.textContent = batchText;
}

function countUrlsInSubtree(node) {
  if (node.url) return 1;
  return (node.children || []).reduce((acc, c) => acc + countUrlsInSubtree(c), 0);
}

// 智能锁定书签栏根节点（兼容同步与非同步状态）
function findScopeRoots(tree) {
  const rootChildren = tree[0]?.children || [];
  const barCandidates = rootChildren.filter(
    (n) => !n.url && (n.folderType === "bookmarks-bar" || n.title === "书签栏" || n.title === "Bookmarks bar")
  );
  barCandidates.sort((a, b) => {
    const syncDiff = (b.syncing === true ? 1 : 0) - (a.syncing === true ? 1 : 0);
    if (syncDiff !== 0) return syncDiff;
    return countUrlsInSubtree(b) - countUrlsInSubtree(a);
  });
  const barNode = barCandidates[0] || rootChildren[0];
  const useSyncing = typeof barNode.syncing === "boolean";
  const scopeRoots = rootChildren.filter((n) => !useSyncing || n.syncing === barNode.syncing);
  return { barNode, scopeRoots };
}

function collectScope(scopeRoots, barNodeId) {
  const urlNodes = [];
  const folderMap = new Map();

  function walk(node, parts) {
    if (node.url) {
      urlNodes.push({
        id: node.id,
        title: node.title || "",
        url: node.url,
        srcPath: parts.join("/"),
      });
    } else {
      const folderName = node.id === barNodeId ? "书签栏" : (node.title || "");
      const curPath = parts.length === 0 ? folderName : `${parts.join("/")}/${folderName}`;
      folderMap.set(curPath, node);
      const nextParts = parts.length === 0 ? [folderName] : [...parts, folderName];
      for (const c of node.children || []) {
        walk(c, nextParts);
      }
    }
  }

  for (const r of scopeRoots) {
    walk(r, []);
  }
  return { urlNodes, folderMap };
}

// 健壮的目录树创建器：支持直接返回顶层根节点，自动补全中间目录
async function ensureFolder(pathStr, folderMap) {
  if (!pathStr || pathStr === "书签栏" || pathStr === "root") {
    return state.barNode;
  }
  if (folderMap.has(pathStr)) return folderMap.get(pathStr);

  const parts = pathStr.split("/").filter(Boolean);
  if (parts.length === 0 || (parts.length === 1 && parts[0] === "书签栏")) {
    return state.barNode;
  }
  if (parts[0] === "书签栏") parts.shift();

  let accumulated = "书签栏";
  let parentNode = state.barNode;
  for (const part of parts) {
    accumulated += `/${part}`;
    if (folderMap.has(accumulated)) {
      parentNode = folderMap.get(accumulated);
    } else {
      const created = await chrome.bookmarks.create({ parentId: parentNode.id, title: part });
      folderMap.set(accumulated, created);
      parentNode = created;
    }
  }
  return parentNode;
}

// ================= Token 消耗与计费计算 =================

function updateTokenDisplay() {
  const { prompt, completion, cached, total } = state.tokens;
  const { inputRate, outputRate, cacheRate, currency } = state.pricing;

  dom.tokPrompt.textContent = prompt.toLocaleString();
  dom.tokCompletion.textContent = completion.toLocaleString();
  dom.tokCached.textContent = cached.toLocaleString();

  if (state.engineMode === "web_session") {
    dom.tokTotalBadge.textContent = "⚡ 网页版会话免费运行 (0 成本)";
    dom.tokCost.textContent = `${currency} 0.0000 (免API)`;
  } else {
    dom.tokTotalBadge.textContent = `总计: ${total.toLocaleString()} Tokens`;
    const nonCachedInput = Math.max(0, prompt - cached);
    const cost = ((nonCachedInput * inputRate) + (cached * cacheRate) + (completion * outputRate)) / 1000000;
    dom.tokCost.textContent = `${currency} ${cost.toFixed(4)}`;
  }
}

// ================= 配置与持久化 =================

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["ai_bookmark_config", "ai_bookmark_meta"], (result) => {
      if (result && result.ai_bookmark_config) {
        state.config = { ...state.config, ...result.ai_bookmark_config };
      }
      if (result && result.ai_bookmark_meta) {
        if (result.ai_bookmark_meta.engineMode) state.engineMode = result.ai_bookmark_meta.engineMode;
        if (result.ai_bookmark_meta.webProvider) state.webProvider = result.ai_bookmark_meta.webProvider;
        if (result.ai_bookmark_meta.pricing) state.pricing = { ...state.pricing, ...result.ai_bookmark_meta.pricing };
      }
      applySettingsToUI();
      resolve();
    });
  });
}

async function saveSettings() {
  state.config.baseUrl = dom.cfgBaseUrl.value.trim();
  state.config.apiKey = dom.cfgApiKey.value.trim();
  state.config.model = dom.cfgModel.value.trim();
  state.config.batchSize = parseInt(dom.cfgBatchSize.value, 10) || 20;
  const parsedTemp = parseFloat(dom.cfgTemperature.value);
  state.config.temperature = Number.isFinite(parsedTemp) && parsedTemp >= 0 ? parsedTemp : 0.2;
  state.config.jsonMode = dom.cfgJsonMode.checked;

  const curPreset = dom.presetSelect.value;
  state.config.currentPreset = curPreset;
  if (!state.config.prompts) state.config.prompts = {};
  state.config.prompts[curPreset] = {
    system: dom.promptSystem.value,
    user: dom.promptUser.value,
  };

  const inRate = parseFloat(dom.priceInputRate.value);
  const outRate = parseFloat(dom.priceOutputRate.value);
  const cRate = parseFloat(dom.priceCacheRate.value);

  // 严防防伪真值陷阱：合法 0 单价不可被 fallback
  state.pricing.inputRate = Number.isFinite(inRate) && inRate >= 0 ? inRate : 0.5;
  state.pricing.outputRate = Number.isFinite(outRate) && outRate >= 0 ? outRate : 1.5;
  state.pricing.cacheRate = Number.isFinite(cRate) && cRate >= 0 ? cRate : 0.1;
  state.pricing.currency = dom.priceCurrency.value || "¥";

  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        ai_bookmark_config: state.config,
        ai_bookmark_meta: {
          engineMode: state.engineMode,
          webProvider: state.webProvider,
          pricing: state.pricing,
        },
      },
      () => {
        updateConnIndicator();
        updateTokenDisplay();
        resolve();
      }
    );
  });
}

function switchEngineMode(mode, shouldSave = true) {
  state.engineMode = mode;
  if (mode === "web_session") {
    dom.btnModeWeb.classList.add("active");
    dom.btnModeApi.classList.remove("active");
    dom.panelWebConfig.style.display = "block";
    dom.panelApiConfig.style.display = "none";
    dom.startAiBtn.textContent = "⚡ 开始网页会话自动化分析";
    dom.workbenchEngineBadge.textContent = "⚡ 网页免API模式运行中";
    dom.workbenchEngineBadge.className = "badge free";
  } else {
    dom.btnModeApi.classList.add("active");
    dom.btnModeWeb.classList.remove("active");
    dom.panelWebConfig.style.display = "none";
    dom.panelApiConfig.style.display = "block";
    dom.startAiBtn.textContent = "🤖 开始 AI 接口分析";
    dom.workbenchEngineBadge.textContent = "🌐 API 接口直连模式";
    dom.workbenchEngineBadge.className = "badge";
  }
  updateConnIndicator();
  updateTokenDisplay();
  if (shouldSave) saveSettings();
}

function applySettingsToUI() {
  // 同步网页会话提供商卡片高亮状态
  if (state.webProvider === "chatgpt") {
    dom.cardWebChatGPT.classList.add("active");
    dom.cardWebDeepSeek.classList.remove("active");
  } else {
    dom.cardWebDeepSeek.classList.add("active");
    dom.cardWebChatGPT.classList.remove("active");
  }

  dom.cfgBaseUrl.value = state.config.baseUrl || "https://api.xiaomimimo.com/v1";
  dom.cfgApiKey.value = state.config.apiKey || "";
  dom.cfgModel.value = state.config.model || "mimo-v2.6-flash";
  dom.cfgBatchSize.value = state.config.batchSize || 20;
  dom.cfgTemperature.value = state.config.temperature ?? 0.2;
  dom.cfgJsonMode.checked = state.config.jsonMode !== false;

  dom.priceInputRate.value = state.pricing.inputRate;
  dom.priceOutputRate.value = state.pricing.outputRate;
  dom.priceCacheRate.value = state.pricing.cacheRate;
  dom.priceCurrency.value = state.pricing.currency;

  const presetKey = state.config.currentPreset || "deep_refactor";
  dom.presetSelect.value = presetKey;
  loadPresetIntoUI(presetKey);

  // 初始化 UI 时禁止反向触发 saveSettings 覆盖已加载配置
  switchEngineMode(state.engineMode || "web_session", false);

  // 渲染厂商与模型标签
  renderProviderTags();
  const curUrl = (dom.cfgBaseUrl.value || "").trim().toLowerCase();
  const matchedProvider = AI_PROVIDERS.find((p) => {
    const cleanTarget = p.baseUrl.toLowerCase().replace(/\/v1$/, "").replace(/\/+$/, "");
    return curUrl && curUrl.startsWith(cleanTarget);
  });
  renderModelTags(matchedProvider || AI_PROVIDERS[0]);

  updateConnIndicator();
  updateTokenDisplay();
}

function loadPresetIntoUI(presetKey) {
  const saved = state.config.prompts?.[presetKey];
  const defaults = PRESETS[presetKey] || PRESETS.deep_refactor;
  dom.promptSystem.value = saved?.system || defaults.system;
  dom.promptUser.value = saved?.user || defaults.user;
}

function updateConnIndicator() {
  if (state.engineMode === "web_session") {
    const provName = state.webProvider === "chatgpt" ? "ChatGPT 网页版" : "DeepSeek 网页版";
    dom.connDot.className = "status-dot active";
    dom.connLabel.textContent = `⚡ 网页免API: ${provName}`;
  } else {
    const hasKey = Boolean(state.config.apiKey && state.config.apiKey.length > 5);
    const model = state.config.model || "未设置模型";
    if (hasKey) {
      dom.connDot.className = "status-dot active";
      dom.connLabel.textContent = `🌐 API: ${model}`;
    } else {
      dom.connDot.className = "status-dot warn";
      dom.connLabel.textContent = "未配置 API Key";
    }
  }
}

// 渲染带官方矢量的厂商标签
function renderProviderTags() {
  if (!dom.providerTagsContainer) return;
  dom.providerTagsContainer.innerHTML = "";

  const groups = {};
  for (const p of AI_PROVIDERS) {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  }

  const curUrl = (dom.cfgBaseUrl.value || "").trim().toLowerCase();

  for (const [catName, providers] of Object.entries(groups)) {
    const row = document.createElement("div");
    row.className = "provider-group";

    const label = document.createElement("span");
    label.className = "provider-group-label";
    label.textContent = catName + "：";
    row.appendChild(label);

    for (const p of providers) {
      const btn = document.createElement("span");
      btn.className = "tag-btn";
      const cleanTarget = p.baseUrl.toLowerCase().replace(/\/v1$/, "").replace(/\/+$/, "");
      const isMatch = curUrl && curUrl.startsWith(cleanTarget);
      if (isMatch) btn.classList.add("active");

      const iconHtml = ICONS[p.iconKey] || "";
      btn.innerHTML = `${iconHtml}<span>${p.name}</span>`;

      btn.addEventListener("click", () => {
        selectProvider(p);
      });
      row.appendChild(btn);
    }
    dom.providerTagsContainer.appendChild(row);
  }
}

function selectProvider(p) {
  dom.cfgBaseUrl.value = p.baseUrl;
  dom.cfgModel.value = p.defaultModel;
  renderModelTags(p);
  renderProviderTags();
}

function renderModelTags(provider) {
  if (!dom.modelTagsContainer) return;
  dom.modelTagsContainer.innerHTML = "";
  const models = provider?.models || [
    "mimo-v2.6-flash", "mimo-v2.6-pro", "deepseek-chat", "gpt-4o-mini", "qwen-plus", "glm-4-flash"
  ];
  const curModel = (dom.cfgModel.value || "").trim();

  for (const m of models) {
    const tag = document.createElement("span");
    tag.className = "tag-btn";
    if (curModel === m) tag.classList.add("active");
    tag.textContent = m;
    tag.addEventListener("click", () => {
      dom.cfgModel.value = m;
      renderModelTags(provider);
    });
    dom.modelTagsContainer.appendChild(tag);
  }
}

// ================= 网页会话自动化连接器 (Web Bridge) =================

async function findWebSessionTab(provider) {
  const urlPattern =
    provider === "chatgpt"
      ? ["*://chatgpt.com/*", "*://*.openai.com/*"]
      : ["*://chat.deepseek.com/*"];

  const tabs = await chrome.tabs.query({ url: urlPattern });
  if (tabs.length > 0) return tabs[0];
  return null;
}

async function detectOrOpenWebSession(interactive = true) {
  const provider = state.webProvider || "deepseek";
  const targetUrl = provider === "chatgpt" ? "https://chatgpt.com" : "https://chat.deepseek.com";
  const statusEl = provider === "chatgpt" ? dom.statusWebChatGPT : dom.statusWebDeepSeek;

  statusEl.textContent = "⏳ 正在检测会话...";
  statusEl.style.color = "var(--text-muted)";

  let tab = await findWebSessionTab(provider);
  if (!tab) {
    if (interactive) {
      log(`[网页桥接] 未检测到打开的 ${provider} 标签，正在为你新建标签页: ${targetUrl}`, "warn");
      tab = await chrome.tabs.create({ url: targetUrl, active: true });
      statusEl.textContent = "🟡 已打开标签，请登录后点击探测";
      statusEl.style.color = "var(--amber)";
      return tab;
    } else {
      statusEl.textContent = "⚪ 未连接标签页";
      statusEl.style.color = "var(--text-dim)";
      return null;
    }
  }

  // 无论先前是否已注入，均执行一次动态注入更新最新桥接代码
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content/web_bridge.js"],
    });
  } catch (_) {}

  // 尝试向该标签发送探测消息
  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: "PING_BRIDGE" });
    if (res && res.ok) {
      statusEl.textContent = `🟢 桥接就绪 (${res.hostname} v${res.version || "1.0.0"})`;
      statusEl.style.color = "#6ee7b7";
      state.webTabId = tab.id;
      log(`[网页桥接] 成功连接至网页标签页 [ID: ${tab.id}] URL: ${tab.url}`, "ok");
      return tab;
    }
  } catch (err) {
    statusEl.textContent = `❌ 无法与网页通信: ${err.message}`;
    statusEl.style.color = "var(--red)";
    log(`[网页桥接] 通信失败: ${err.message}`, "err");
    return null;
  }
  return tab;
}

// ================= 书签扫描与作用域 =================

async function scanBookmarks() {
  setProgress(5, "正在读取 Chrome 书签树结构...");
  log("开始扫描 Chrome 书签系统...");

  const tree = await chrome.bookmarks.getTree();
  const { barNode, scopeRoots } = findScopeRoots(tree);
  state.barNode = barNode;
  state.scopeRoots = scopeRoots;

  const { urlNodes, folderMap } = collectScope(scopeRoots, barNode.id);
  state.allUrlNodes = urlNodes;
  state.folderMap = folderMap;

  // 填充作用域下拉菜单
  dom.scopeFolderSelect.innerHTML = `<option value="ROOT_ALL">书签栏 (全量扫描: ${urlNodes.length} 个书签)</option>`;
  const sortedFolders = Array.from(folderMap.keys()).sort();
  for (const fpath of sortedFolders) {
    const fNode = folderMap.get(fpath);
    const count = countUrlsInSubtree(fNode);
    if (count > 0) {
      const opt = document.createElement("option");
      opt.value = fpath;
      opt.textContent = `${fpath} (${count} 个书签)`;
      dom.scopeFolderSelect.appendChild(opt);
    }
  }

  // 更新 datalist
  dom.folderPathDatalist.innerHTML = "";
  for (const fpath of sortedFolders) {
    const opt = document.createElement("option");
    opt.value = fpath;
    dom.folderPathDatalist.appendChild(opt);
  }

  updateSelectedScopeItems();
  setProgress(100, `扫描就绪，共发现 ${state.scannedItems.length} 个书签待重构`, "完成");
  log(`书签扫描完成: 书签栏根目录 ID=${barNode.id}, 总识别有效书签=${urlNodes.length}`, "ok");

  // 渲染双栏树
  renderTreeView();
}

function updateSelectedScopeItems() {
  const selectedScope = dom.scopeFolderSelect.value;
  if (selectedScope === "ROOT_ALL") {
    state.scannedItems = [...state.allUrlNodes];
  } else {
    state.scannedItems = state.allUrlNodes.filter(
      (n) => n.srcPath === selectedScope || n.srcPath.startsWith(`${selectedScope}/`)
    );
  }
  dom.stTotalScanned.textContent = state.scannedItems.length;
}

// ================= AI 分析执行管线（支持网页免API与API直连，异常对称与状态机保护） =================

async function startAiAnalysis() {
  if (state.isAnalyzing) {
    log("已有分析任务正在运行中，请勿重复点击。", "warn");
    return;
  }
  if (state.scannedItems.length === 0) {
    alert("当前作用域没有扫描到任何书签，请先扫描！");
    return;
  }

  state.isAnalyzing = true;
  state.abortController = new AbortController();
  dom.startAiBtn.disabled = true;
  dom.stopAiBtn.disabled = false;
  dom.scanBtn.disabled = true;
  dom.applyChangesBtn.disabled = true;

  // 重置 tokens 统计
  state.tokens = { prompt: 0, completion: 0, cached: 0, total: 0 };
  updateTokenDisplay();

  const totalItems = state.scannedItems.length;
  const batchSize =
    state.engineMode === "web_session"
      ? parseInt(dom.webBatchSize.value, 10) || 20
      : state.config.batchSize || 20;

  const totalBatches = Math.ceil(totalItems / batchSize);
  const modeLabel = state.engineMode === "web_session" ? "⚡ 网页会话免API模式" : "🌐 API 接口模式";

  log(`🚀 开始智能分析任务 [${modeLabel}]: 目标数=${totalItems}, 批大小=${batchSize}, 批次数=${totalBatches}`);
  setProgress(0, "正在初始化批处理任务...", `0 / ${totalBatches}`);

  const folderListStr = Array.from(state.folderMap.keys())
    .map((p) => `- ${p}`)
    .join("\n");

  const systemPromptTemplate = dom.promptSystem.value;
  const userPromptTemplate = dom.promptUser.value;

  state.ledgerItems = [];
  let processedCount = 0;

  try {
    let targetTab = null;
    if (state.engineMode === "web_session") {
      targetTab = await detectOrOpenWebSession(true);
      if (!targetTab) {
        log("未能连接到网页会话标签页，请确保打开并登录了 DeepSeek 或 ChatGPT 网页版！", "err");
        alert("未能连接到网页会话标签页，请先在【引擎配置】中点击【检测并打开网页会话】！");
        return;
      }
    }

    for (let i = 0; i < totalBatches; i++) {
      if (!state.isAnalyzing) {
        log("用户中断了 AI 分析任务。", "warn");
        break;
      }

      const batchIndex = i + 1;
      const startIdx = i * batchSize;
      const endIdx = Math.min(startIdx + batchSize, totalItems);
      const chunk = state.scannedItems.slice(startIdx, endIdx);

      const pct = ((i / totalBatches) * 100).toFixed(1);
      setProgress(pct, `正在分析批次 [${batchIndex}/${totalBatches}] (${chunk.length}项)...`, `${batchIndex} / ${totalBatches}`);
      log(`正在处理批次 [${batchIndex}/${totalBatches}]: 范围 [${startIdx + 1} - ${endIdx}]...`);

      const chunkPromptData = chunk.map((c) => ({
        id: c.id,
        title: c.title,
        url: c.url,
        current_path: c.srcPath,
      }));

      const finalSystemPrompt = systemPromptTemplate
        .replaceAll("{{FOLDER_TREE}}", folderListStr)
        .replaceAll("{{BOOKMARK_LIST}}", JSON.stringify(chunkPromptData, null, 2));

      const finalUserPrompt = userPromptTemplate
        .replaceAll("{{FOLDER_TREE}}", folderListStr)
        .replaceAll("{{BOOKMARK_LIST}}", JSON.stringify(chunkPromptData, null, 2));

      try {
        let rawContent = "";

        if (state.engineMode === "web_session") {
          const combinedPrompt = `${finalSystemPrompt}\n\n====================\n\n${finalUserPrompt}`;
          log(`[网页桥接] 发送批次 [${batchIndex}] 到网页标签 [ID: ${targetTab.id}]...`);

          const timeoutSec = parseInt(dom.webWaitTimeout.value, 10) || 120;
          let res;
          try {
            res = await chrome.tabs.sendMessage(targetTab.id, {
              type: "EXECUTE_WEB_TURN",
              prompt: combinedPrompt,
              timeoutMs: timeoutSec * 1000,
            });
          } catch (msgErr) {
            log(`[网页通信] 消息信道提示 (${msgErr.message})，正启用 GitHub 社区标准 DOM 探针自动拯救...`, "warn");
          }

          if (res && res.aborted) {
            const abortErr = new Error("用户中止分析");
            abortErr.name = "AbortError";
            throw abortErr;
          }

          if (res && res.ok && res.reply) {
            rawContent = res.reply;
          } else {
            // 容灾救赎：直接通过 executeScript 嗅探最新助手回复（兼容 ChatGPT 新版 /uc/ 与经典版 + DeepSeek）
            const probeResults = await chrome.scripting.executeScript({
              target: { tabId: targetTab.id },
              func: () => {
                const els = Array.from(
                  document.querySelectorAll(
                    '[data-message-role="assistant"], [data-message-author-role="assistant"], .ds-markdown, .ds-message-content'
                  )
                );
                for (let i = els.length - 1; i >= 0; i--) {
                  const el = els[i];
                  const code = el.querySelector("pre, code");
                  if (code) {
                    const t = (code.innerText || code.textContent || "").trim();
                    if (t.includes("{") || t.includes("[")) return t;
                  }
                  const sections = Array.from(el.querySelectorAll("section"));
                  for (const sec of sections) {
                    const t = (sec.innerText || sec.textContent || "").trim();
                    if (t.includes("{") || t.includes("[")) return t;
                  }
                  const t = (el.innerText || el.textContent || "").trim();
                  if (t.includes('"operations"') || (t.includes('"id"') && t.includes('"action"'))) return t;
                }
                return "";
              },
            });
            const probed = probeResults?.[0]?.result;
            if (probed && probed.length > 20) {
              log(`[网页探针] 成功通过 DOM 自动拯救提取到回复 (${probed.length} 字)！`, "ok");
              rawContent = probed;
            } else {
              throw new Error(res?.error || "网页端返回空或响应超时，请确认网页标签页未被阻断");
            }
          }

          const estPromptTokens = Math.round(combinedPrompt.length * 1.2);
          const estCompTokens = Math.round(rawContent.length * 1.2);
          state.tokens.prompt += estPromptTokens;
          state.tokens.completion += estCompTokens;
          state.tokens.total += estPromptTokens + estCompTokens;
          updateTokenDisplay();
        } else {
          const resp = await window.AiClient.callChatCompletion({
            baseUrl: state.config.baseUrl,
            apiKey: state.config.apiKey,
            model: state.config.model,
            temperature: state.config.temperature,
            systemPrompt: finalSystemPrompt,
            userPrompt: finalUserPrompt,
            jsonMode: state.config.jsonMode,
            signal: state.abortController.signal,
          });
          rawContent = resp.rawContent;

          if (resp.usage) {
            const p = Number(resp.usage.prompt_tokens) || 0;
            const c = Number(resp.usage.completion_tokens) || 0;
            const cached =
              Number(resp.usage.prompt_tokens_details?.cached_tokens) ||
              Number(resp.usage.prompt_cache_hit_tokens) ||
              Number(resp.usage.cached_tokens) || 0;
            const tot = Number(resp.usage.total_tokens) || (p + c);

            state.tokens.prompt += p;
            state.tokens.completion += c;
            state.tokens.cached += cached;
            state.tokens.total += tot;
            updateTokenDisplay();
            log(`批次 [${batchIndex}] Token 统计: 输入=${p}, 输出=${c}, 缓存=${cached}`, "info");
          }
        }

        const parsed = window.AiClient.extractJsonFromText(rawContent);
        const operations = Array.isArray(parsed.operations)
          ? parsed.operations
          : Array.isArray(parsed)
          ? parsed
          : [];

        const opMap = new Map();
        for (const op of operations) {
          if (op && op.id) opMap.set(String(op.id), op);
        }

        for (const item of chunk) {
          const op = opMap.get(String(item.id)) || { action: "keep", reason: "AI 判定无需调整" };
          const action = op.action || "keep";
          const newTitle = op.new_title && op.new_title.trim() ? op.new_title.trim() : item.title;
          const newPath = op.target_path && op.target_path.trim() ? op.target_path.trim() : item.srcPath;
          const rawNewUrl = op.new_url && op.new_url.trim() ? op.new_url.trim() : null;
          const isUrlChanged = Boolean(rawNewUrl && rawNewUrl !== item.url);
          const newUrl = isUrlChanged ? rawNewUrl : item.url;
          const reason = op.reason || "";

          const isTitleChanged = newTitle !== item.title;
          const isPathChanged = newPath !== item.srcPath;
          const isDelete = action === "delete";
          const hasChange = isTitleChanged || isPathChanged || isUrlChanged || isDelete;

          let opType = "keep";
          if (isDelete) opType = "delete";
          else if (isUrlChanged) opType = "url_fix";
          else if (isTitleChanged && isPathChanged) opType = "both";
          else if (isPathChanged) opType = "move";
          else if (isTitleChanged) opType = "rename";

          state.ledgerItems.push({
            id: item.id,
            url: item.url,
            oldTitle: item.title,
            newTitle: newTitle,
            oldPath: item.srcPath,
            newPath: newPath,
            oldUrl: item.url,
            newUrl: newUrl,
            isUrlChanged: isUrlChanged,
            action: action,
            opType: opType,
            reason: reason,
            hasChange: hasChange,
            selected: hasChange,
          });
        }

        processedCount += chunk.length;
        log(`批次 [${batchIndex}/${totalBatches}] 成功处理，解析到 ${operations.length} 条有效决策。`, "ok");
        renderDiffTable();
      } catch (err) {
        if (err.name === "AbortError" || !state.isAnalyzing) {
          log("批次请求已取消。", "warn");
          break;
        }
        log(`批次 [${batchIndex}/${totalBatches}] 发生异常: ${err.message}`, "err");
        for (const item of chunk) {
          state.ledgerItems.push({
            id: item.id,
            url: item.url,
            oldTitle: item.title,
            newTitle: item.title,
            oldPath: item.srcPath,
            newPath: item.srcPath,
            oldUrl: item.url,
            newUrl: item.url,
            isUrlChanged: false,
            action: "keep",
            opType: "keep",
            reason: `批次解析异常: ${err.message}`,
            hasChange: false,
            selected: false,
          });
        }
        renderDiffTable();
      }
    }
  } finally {
    // 退出对称性保证：无论成功、中止或抛错，严密恢复状态机
    state.isAnalyzing = false;
    state.abortController = null;
    dom.startAiBtn.disabled = false;
    dom.stopAiBtn.disabled = true;
    dom.scanBtn.disabled = false;
    const selCount = state.ledgerItems.filter((i) => i.selected).length;
    dom.applyChangesBtn.disabled = selCount === 0;
    dom.stSelected.textContent = selCount;

    if (processedCount === totalItems) {
      setProgress(100, `智能分析全量完成，共处理 ${processedCount} 项书签`, "完成");
    }
    renderDiffTable();
  }
}

function stopAiAnalysis() {
  if (state.abortController) {
    state.abortController.abort();
    state.abortController = null;
  }
  if (state.webTabId) {
    chrome.tabs.sendMessage(state.webTabId, { type: "CANCEL_WEB_TURN" }).catch(() => {});
  }
  state.isAnalyzing = false;
  dom.startAiBtn.disabled = false;
  dom.stopAiBtn.disabled = true;
  dom.scanBtn.disabled = false;
  const selCount = state.ledgerItems.filter((i) => i.selected).length;
  dom.applyChangesBtn.disabled = selCount === 0;
  dom.stSelected.textContent = selCount;

  setProgress(
    dom.workbenchProgress.style.width ? parseFloat(dom.workbenchProgress.style.width) : 0,
    "分析任务已由用户手动中止",
    "已中止"
  );
  log("AI 分析任务已被手动中止。", "warn");
}

// ================= 人机保底回贴功能 (双保险) =================

function copyCurrentBatchPrompt() {
  if (state.scannedItems.length === 0) {
    alert("请先扫描书签！");
    return;
  }
  const batchSize = parseInt(dom.webBatchSize.value, 10) || 20;
  const chunk = state.scannedItems.slice(0, batchSize);
  const folderListStr = Array.from(state.folderMap.keys()).map((p) => `- ${p}`).join("\n");

  const chunkPromptData = chunk.map((c) => ({
    id: c.id,
    title: c.title,
    url: c.url,
    current_path: c.srcPath,
  }));

  const fullPrompt = `${dom.promptSystem.value}\n\n====================\n\n${dom.promptUser.value}`
    .replaceAll("{{FOLDER_TREE}}", folderListStr)
    .replaceAll("{{BOOKMARK_LIST}}", JSON.stringify(chunkPromptData, null, 2));

  navigator.clipboard.writeText(fullPrompt).then(() => {
    alert(`✅ 已复制前 ${chunk.length} 项书签的完整治理提示词！\n可直接粘贴到任意网页版 AI 中，生成后点击【粘贴并解析网页回复】回填。`);
    log(`[手动中转] 已复制 ${chunk.length} 项书签提示词到剪贴板`, "ok");
  });
}

function applyParsedOperationsFromText(text, sourceLabel = "人工中转") {
  const parsed = window.AiClient.extractJsonFromText(text.trim());
  const operations = Array.isArray(parsed.operations) ? parsed.operations : Array.isArray(parsed) ? parsed : [];
  if (operations.length === 0) {
    throw new Error("未能从文本中识别到有效的 operations JSON 数组！请确认包含 [ { \"id\": ... } ]");
  }

  const opMap = new Map();
  for (const op of operations) {
    if (op && op.id) opMap.set(String(op.id), op);
  }

  let appliedCount = 0;
  for (const item of state.scannedItems) {
    const op = opMap.get(String(item.id));
    if (!op) continue;

    appliedCount++;
    const action = op.action || "keep";
    const newTitle = op.new_title && op.new_title.trim() ? op.new_title.trim() : item.title;
    const newPath = op.target_path && op.target_path.trim() ? op.target_path.trim() : item.srcPath;
    const rawNewUrl = op.new_url && op.new_url.trim() ? op.new_url.trim() : null;
    const isUrlChanged = Boolean(rawNewUrl && rawNewUrl !== item.url);
    const newUrl = isUrlChanged ? rawNewUrl : item.url;
    const reason = op.reason || `${sourceLabel}建议`;

    const isTitleChanged = newTitle !== item.title;
    const isPathChanged = newPath !== item.srcPath;
    const isDelete = action === "delete";
    const hasChange = isTitleChanged || isPathChanged || isUrlChanged || isDelete;

    let opType = "keep";
    if (isDelete) opType = "delete";
    else if (isUrlChanged) opType = "url_fix";
    else if (isTitleChanged && isPathChanged) opType = "both";
    else if (isPathChanged) opType = "move";
    else if (isTitleChanged) opType = "rename";

    const existIdx = state.ledgerItems.findIndex((i) => i.id === item.id);
    const record = {
      id: item.id,
      url: item.url,
      oldTitle: item.title,
      newTitle: newTitle,
      oldPath: item.srcPath,
      newPath: newPath,
      oldUrl: item.url,
      newUrl: newUrl,
      isUrlChanged: isUrlChanged,
      action: action,
      opType: opType,
      reason: reason,
      hasChange: hasChange,
      selected: hasChange,
    };

    if (existIdx >= 0) {
      state.ledgerItems[existIdx] = record;
    } else {
      state.ledgerItems.push(record);
    }
  }

  log(`[${sourceLabel}] 成功解析并应用 ${appliedCount} 条书签治理建议！`, "ok");
  renderDiffTable();
  if (state.activeDiffView === "tree") renderTreeView();
  return appliedCount;
}

async function grabWebReplyDirectly() {
  log("[网页读取] 正在连接网页版 AI 会话提取所有已生成结果...", "info");
  const tab = await detectOrOpenWebSession(false);
  if (!tab) {
    alert("未检测到已打开的 ChatGPT 或 DeepSeek 网页标签页！请先打开相应网页。");
    return;
  }

  try {
    log(`[网页读取] 正在从标签页 [ID: ${tab.id}] 实时提取全部助手回复...`, "info");

    // 直接在目标标签页执行 DOM 提取，兼容 ChatGPT 新版 /uc/ (data-message-role + section)、经典版与 DeepSeek
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const extractFromEl = (el) => {
          const codes = Array.from(el.querySelectorAll("pre, code"));
          for (let i = codes.length - 1; i >= 0; i--) {
            const t = (codes[i].innerText || codes[i].textContent || "").trim();
            if (t.includes("{") || t.includes("[")) return t;
          }
          const sections = Array.from(el.querySelectorAll("section"));
          for (const sec of sections) {
            const t = (sec.innerText || sec.textContent || "").trim();
            if (t.includes("{") || t.includes("[")) return t;
          }
          return (el.innerText || el.textContent || "").trim();
        };

        const rawEls = Array.from(
          document.querySelectorAll(
            '[data-message-role="assistant"], [data-message-author-role="assistant"], .ds-markdown, .ds-message-content'
          )
        ).filter((el) => !el.parentElement?.closest('[data-message-role="assistant"], [data-message-author-role="assistant"], .ds-markdown, .ds-message-content'));

        const replies = [];
        for (const el of rawEls) {
          const t = extractFromEl(el);
          if (t && t.length > 20 && (t.includes('"operations"') || (t.includes('"id"') && t.includes('"action"')))) {
            replies.push(t);
          }
        }
        return replies;
      },
    });

    const replyList = Array.isArray(results?.[0]?.result) ? results[0].result : [];
    if (replyList.length === 0) {
      alert("网页端未能提取到包含书签 JSON 的助手回复！\n请确认右侧网页已输出完毕，若仍在生成中请稍候片刻重试。");
      return;
    }

    // 合并页面中所有批次的助手回复，一次点击即可全量入账
    let totalApplied = 0;
    let parsedBatches = 0;
    for (const rawReply of replyList) {
      try {
        totalApplied += applyParsedOperationsFromText(rawReply, "网页直接提取");
        parsedBatches++;
      } catch (parseErr) {
        log(`[网页读取] 跳过一条无法解析的回复: ${parseErr.message}`, "warn");
      }
    }

    if (totalApplied === 0) {
      alert("已抓取到网页回复，但未能匹配当前扫描作用域内的任何书签 ID！请确认作用域下拉框与网页生成批次一致。");
      return;
    }

    alert(`🎉 成功从网页提取 ${parsedBatches} 轮回复并解析入账 ${totalApplied} 项书签决策！\n已刷新 Diff 账本，可直接在下方审查与执行。`);
  } catch (err) {
    log(`[网页读取] 读取失败: ${err.message}`, "err");
    alert(`无法从网页读取回复: ${err.message}`);
  }
}

function pasteWebReplyManually() {
  const text = prompt("请在此粘贴网页版 AI 回复的全部内容（包含 JSON 代码块）：");
  if (!text || !text.trim()) return;

  try {
    const count = applyParsedOperationsFromText(text.trim(), "手动粘贴");
    alert(`🎉 成功解析并应用 ${count} 条书签决策！已刷新 Diff 账本。`);
  } catch (err) {
    alert(`解析失败: ${err.message}`);
    log(`[手动中转] 解析异常: ${err.message}`, "err");
  }
}

// ================= Diff 变更账本渲染与过滤 =================

function renderDiffTable() {
  const filter = state.currentFilter;
  let items = state.ledgerItems;

  const total = items.length;
  const changed = items.filter((i) => i.hasChange).length;
  const urlFixes = items.filter((i) => i.isUrlChanged).length;
  const moves = items.filter((i) => i.opType === "move" || i.opType === "both").length;
  const renames = items.filter((i) => i.opType === "rename" || i.opType === "both").length;
  const deletes = items.filter((i) => i.opType === "delete").length;
  const selected = items.filter((i) => i.selected).length;

  dom.cntAll.textContent = total;
  dom.cntChanged.textContent = changed;
  dom.cntUrlFix.textContent = urlFixes;
  dom.cntMove.textContent = moves;
  dom.cntRename.textContent = renames;
  dom.cntDelete.textContent = deletes;

  dom.stProposed.textContent = changed;
  dom.stMoves.textContent = moves;
  dom.stRenames.textContent = renames;
  dom.stUrlFixes.textContent = urlFixes;
  dom.stSelected.textContent = selected;
  dom.applyChangesBtn.disabled = selected === 0;

  let displayItems = items;
  if (filter === "changed") {
    displayItems = items.filter((i) => i.hasChange);
  } else if (filter === "url_fix") {
    displayItems = items.filter((i) => i.isUrlChanged);
  } else if (filter === "move") {
    displayItems = items.filter((i) => i.opType === "move" || i.opType === "both");
  } else if (filter === "rename") {
    displayItems = items.filter((i) => i.opType === "rename" || i.opType === "both");
  } else if (filter === "delete") {
    displayItems = items.filter((i) => i.opType === "delete");
  }

  // 联动更新 Master Checkbox 选中与半选状态
  const allVisibleSelected = displayItems.length > 0 && displayItems.every((i) => i.selected);
  const someVisibleSelected = displayItems.some((i) => i.selected);
  dom.masterCheckbox.checked = allVisibleSelected;
  dom.masterCheckbox.indeterminate = !allVisibleSelected && someVisibleSelected;

  if (displayItems.length === 0) {
    dom.diffTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 36px; color: var(--text-dim);">
          ${items.length === 0 ? "暂无分析计划。点击上方按钮启动智能分析。" : "当前过滤条件下没有匹配的书签项。"}
        </td>
      </tr>`;
  } else {
    const rowsHtml = displayItems
      .map((item) => {
        const isTitleChanged = item.newTitle !== item.oldTitle;
        const isPathChanged = item.newPath !== item.oldPath;
        const isUrlChanged = item.isUrlChanged;

        let opBadge = "";
        if (item.opType === "delete") opBadge = `<span class="badge-op delete">删除</span>`;
        else if (item.opType === "url_fix") opBadge = `<span class="badge-op url_fix">URL纠偏</span>`;
        else if (item.opType === "both") opBadge = `<span class="badge-op both">改名+移动</span>`;
        else if (item.opType === "move") opBadge = `<span class="badge-op move">移动</span>`;
        else if (item.opType === "rename") opBadge = `<span class="badge-op rename">改名</span>`;
        else opBadge = `<span class="badge-op keep">保持</span>`;

        return `
          <tr data-id="${escapeHtml(item.id)}" style="${item.hasChange ? '' : 'opacity: 0.6;'}">
            <td style="text-align: center;">
              <input type="checkbox" class="item-cb" data-id="${escapeHtml(item.id)}" ${item.selected ? "checked" : ""}>
            </td>
            <td>${opBadge}</td>
            <td>
              <div style="font-weight: 500; ${isTitleChanged ? 'color: #6ee7b7;' : ''}">${escapeHtml(item.newTitle)}</div>
              ${isTitleChanged ? `<div style="font-size: 11px; color: var(--text-dim); text-decoration: line-through;">${escapeHtml(item.oldTitle)}</div>` : ""}
              ${isUrlChanged ? `<div style="font-size: 10px; color: #d8b4fe; word-break: break-all; margin-top: 2px;">🔗 新URL: ${escapeHtml(item.newUrl)}</div>` : ""}
            </td>
            <td>
              <div style="font-weight: 500; ${isPathChanged ? 'color: #fcd34d;' : ''}">${escapeHtml(item.newPath)}</div>
              ${isPathChanged ? `<div style="font-size: 11px; color: var(--text-dim); text-decoration: line-through;">${escapeHtml(item.oldPath)}</div>` : ""}
            </td>
            <td style="color: var(--text-muted); font-size: 11px;">${escapeHtml(item.reason || "-")}</td>
            <td style="text-align: center;">
              <button class="secondary sm btn-table-edit" data-id="${escapeHtml(item.id)}" title="在双栏树中编辑">✏️</button>
            </td>
          </tr>
        `;
      })
      .join("");
    dom.diffTableBody.innerHTML = rowsHtml;
  }

  // 绑定表格事件
  dom.diffTableBody.querySelectorAll(".item-cb").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      const targetItem = state.ledgerItems.find((i) => i.id === id);
      if (targetItem) {
        targetItem.selected = e.target.checked;
        const selCount = state.ledgerItems.filter((i) => i.selected).length;
        dom.stSelected.textContent = selCount;
        dom.applyChangesBtn.disabled = selCount === 0;

        // 重新同步表头 master 复选框状态
        const visibleNow = displayItems;
        const allSel = visibleNow.length > 0 && visibleNow.every((i) => i.selected);
        const someSel = visibleNow.some((i) => i.selected);
        dom.masterCheckbox.checked = allSel;
        dom.masterCheckbox.indeterminate = !allSel && someSel;

        renderTreeView();
      }
    });
  });

  dom.diffTableBody.querySelectorAll(".btn-table-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.editingItemId = btn.dataset.id;
      switchDiffView("tree");
    });
  });

  // 同步双栏树视图
  renderTreeView();
}

// ================= 双栏目录树视图渲染与即时编辑 =================

function switchDiffView(viewMode) {
  state.activeDiffView = viewMode;
  if (viewMode === "tree") {
    dom.btnViewTree.classList.add("active");
    dom.btnViewTable.classList.remove("active");
    dom.diffTableViewContainer.style.display = "none";
    dom.diffTreeViewContainer.style.display = "block";
    renderTreeView();
  } else {
    dom.btnViewTable.classList.add("active");
    dom.btnViewTree.classList.remove("active");
    dom.diffTableViewContainer.style.display = "block";
    dom.diffTreeViewContainer.style.display = "none";
    renderDiffTable();
  }
}

function renderTreeView() {
  if (state.activeDiffView !== "tree" && dom.diffTreeViewContainer.style.display === "none") {
    return;
  }

  const keyword = state.treeSearchKeyword.toLowerCase();
  const origItems = state.scannedItems;
  const propItems = state.ledgerItems.length > 0 ? state.ledgerItems : state.scannedItems;

  dom.origTreeCount.textContent = `${origItems.length} 项`;
  dom.propTreeCount.textContent = `${propItems.length} 项`;

  const origTreeRoot = buildTreeStructure(origItems, false);
  const propTreeRoot = buildTreeStructure(propItems, true);

  dom.origTreeContent.innerHTML = renderTreeFolderHtml(origTreeRoot, false, keyword);
  dom.propTreeContent.innerHTML = renderTreeFolderHtml(propTreeRoot, true, keyword);
}

function buildTreeStructure(items, isProposed = false) {
  const root = {
    name: "书签栏",
    path: "书签栏",
    subfolders: new Map(),
    items: [],
  };

  for (const item of items) {
    if (isProposed && item.action === "delete" && item.selected) {
      if (!root.subfolders.has("🗑️ 已建议删除")) {
        root.subfolders.set("🗑️ 已建议删除", {
          name: "🗑️ 已建议删除",
          path: "书签栏/🗑️ 已建议删除",
          isDeleteTrash: true,
          subfolders: new Map(),
          items: [],
        });
      }
      root.subfolders.get("🗑️ 已建议删除").items.push(item);
      continue;
    }

    const pathStr = isProposed
      ? (item.selected ? item.newPath : item.oldPath) || "书签栏"
      : item.oldPath || item.srcPath || "书签栏";

    const parts = pathStr.split("/").filter(Boolean);
    if (parts[0] === "书签栏") parts.shift();

    let cur = root;
    let accumulated = "书签栏";
    for (const p of parts) {
      accumulated += `/${p}`;
      if (!cur.subfolders.has(p)) {
        cur.subfolders.set(p, {
          name: p,
          path: accumulated,
          subfolders: new Map(),
          items: [],
          isNewFolder: isProposed && !state.folderMap.has(accumulated),
        });
      }
      cur = cur.subfolders.get(p);
    }
    cur.items.push(item);
  }
  return root;
}

function renderTreeFolderHtml(folder, isProposed = false, keyword = "") {
  const isCollapsed = state.collapsedFolders.has(folder.path);
  let subfoldersHtml = "";
  for (const sub of folder.subfolders.values()) {
    subfoldersHtml += renderTreeFolderHtml(sub, isProposed, keyword);
  }

  let itemsHtml = "";
  let matchedCount = 0;
  for (const item of folder.items) {
    const title = isProposed ? (item.selected ? item.newTitle : item.oldTitle) : item.title || item.oldTitle;
    const url = isProposed ? (item.selected ? item.newUrl : item.oldUrl) : item.url;
    const matchKeyword = !keyword || (title && title.toLowerCase().includes(keyword)) || (url && url.toLowerCase().includes(keyword));

    if (matchKeyword) {
      matchedCount++;
      itemsHtml += renderTreeItemHtml(item, isProposed);
    }
  }

  if (keyword && matchedCount === 0 && !subfoldersHtml) {
    return "";
  }

  const totalItemCount = folder.items.length;
  const badgeClass = folder.isNewFolder ? "tree-folder-badge new-dir" : "tree-folder-badge";
  const badgeText = folder.isNewFolder ? "新目录" : `${totalItemCount} 项`;

  return `
    <div class="tree-node-folder" data-path="${escapeHtml(folder.path)}">
      <div class="tree-folder-head" data-path="${escapeHtml(folder.path)}">
        <span class="tree-arrow ${isCollapsed ? "" : "open"}">▶</span>
        <span class="tree-folder-icon">${folder.isDeleteTrash ? "🗑️" : (isCollapsed ? "📁" : "📂")}</span>
        <span class="tree-folder-name">${escapeHtml(folder.name)}</span>
        <span class="${badgeClass}">${badgeText}</span>
      </div>
      <div class="tree-node-children ${isCollapsed ? "collapsed" : ""}">
        ${subfoldersHtml}
        ${itemsHtml}
      </div>
    </div>
  `;
}

function renderTreeItemHtml(item, isProposed = false) {
  const isEditing = state.editingItemId === item.id;
  if (!isProposed) {
    const linkedOp = state.ledgerItems.find((i) => i.id === item.id);
    let statusTag = "";
    if (linkedOp && linkedOp.hasChange && linkedOp.selected) {
      if (linkedOp.action === "delete") statusTag = `<span class="badge-op delete" style="font-size:9px;">将删除</span>`;
      else if (linkedOp.opType === "url_fix") statusTag = `<span class="badge-op url_fix" style="font-size:9px;">将纠偏URL</span>`;
      else if (linkedOp.newPath !== linkedOp.oldPath) statusTag = `<span class="badge-op move" style="font-size:9px;">将移出</span>`;
      else if (linkedOp.newTitle !== linkedOp.oldTitle) statusTag = `<span class="badge-op rename" style="font-size:9px;">将改名</span>`;
    }
    return `
      <div class="tree-leaf-item ${linkedOp?.hasChange && linkedOp?.selected ? 'has-change' : ''}">
        <div class="tree-leaf-main">
          <span>🔗</span>
          <div class="tree-leaf-text">
            <div class="tree-leaf-title">${escapeHtml(item.title || item.oldTitle)} ${statusTag}</div>
            <div class="tree-leaf-sub">${escapeHtml(item.url || item.oldUrl)}</div>
          </div>
        </div>
      </div>
    `;
  }

  // 右侧拟定树行
  const isSelected = item.selected !== false;
  const isDelete = item.action === "delete";
  const isUrlFix = item.isUrlChanged;
  const isMove = item.newPath !== item.oldPath;
  const isRename = item.newTitle !== item.oldTitle;

  let rowModClass = "";
  if (isDelete) rowModClass = "is-delete";
  else if (isUrlFix) rowModClass = "is-url-fix";
  else if (isMove) rowModClass = "is-move";
  else if (item.hasChange) rowModClass = "has-change";

  if (isEditing) {
    return `
      <div class="tree-inline-editor" data-id="${escapeHtml(item.id)}">
        <div style="font-size: 11px; font-weight: 600; color: #93c5fd; display: flex; justify-content: space-between;">
          <span>✏️ 编辑书签决策</span>
          <span style="color: var(--text-dim);">ID: ${escapeHtml(item.id)}</span>
        </div>
        <div>
          <label>标题 (Title)</label>
          <input type="text" id="inlineTitle_${escapeHtml(item.id)}" value="${escapeHtml(item.newTitle || item.oldTitle)}" style="width: 100%;">
        </div>
        <div>
          <label>目标目录路径 (Target Path, 自动联想)</label>
          <input type="text" id="inlinePath_${escapeHtml(item.id)}" list="folderPathDatalist" value="${escapeHtml(item.newPath || item.oldPath)}" style="width: 100%;">
        </div>
        <div>
          <label>目标 URL (纠偏或新链接)</label>
          <input type="text" id="inlineUrl_${escapeHtml(item.id)}" value="${escapeHtml(item.newUrl || item.oldUrl)}" style="width: 100%;">
        </div>
        <div class="editor-btn-row">
          <button class="secondary sm btn-inline-reset" data-id="${escapeHtml(item.id)}">恢复原始状态</button>
          <button class="secondary sm btn-inline-cancel" data-id="${escapeHtml(item.id)}">取消</button>
          <button class="primary sm btn-inline-save" data-id="${escapeHtml(item.id)}">保存修改</button>
        </div>
      </div>
    `;
  }

  let tagHtml = "";
  if (isDelete) tagHtml = `<span class="badge-op delete" style="font-size:9px;">删除</span>`;
  else if (isUrlFix) tagHtml = `<span class="badge-op url_fix" style="font-size:9px;">URL纠偏</span>`;
  else if (isRename && isMove) tagHtml = `<span class="badge-op both" style="font-size:9px;">改名+移动</span>`;
  else if (isMove) tagHtml = `<span class="badge-op move" style="font-size:9px;">移动</span>`;
  else if (isRename) tagHtml = `<span class="badge-op rename" style="font-size:9px;">改名</span>`;

  return `
    <div class="tree-leaf-item ${rowModClass}">
      <div class="tree-leaf-main">
        <input type="checkbox" class="tree-item-cb" data-id="${escapeHtml(item.id)}" ${isSelected ? "checked" : ""}>
        <div class="tree-leaf-text">
          <div class="tree-leaf-title ${isRename ? 'diff-new' : ''}">
            ${escapeHtml(item.newTitle || item.oldTitle)} ${tagHtml}
          </div>
          <div class="tree-leaf-sub">
            ${isUrlFix ? `<span style="color:#c084fc;">新: ${escapeHtml(item.newUrl)}</span>` : escapeHtml(item.newUrl || item.oldUrl)}
          </div>
        </div>
      </div>
      <div class="tree-leaf-actions">
        <button class="secondary sm btn-tree-edit" data-id="${escapeHtml(item.id)}" title="编辑此项" style="padding: 2px 6px; font-size: 11px;">✏️</button>
      </div>
    </div>
  `;
}

// 采用容器级事件委托（Event Delegation），彻底消除全局循环绑定与内存泄漏
function setupTreeEventDelegation() {
  const container = dom.diffTreeViewContainer;

  container.addEventListener("click", (e) => {
    // 1. 文件夹折叠与展开
    const folderHead = e.target.closest(".tree-folder-head");
    if (folderHead) {
      const path = folderHead.dataset.path;
      if (state.collapsedFolders.has(path)) {
        state.collapsedFolders.delete(path);
      } else {
        state.collapsedFolders.add(path);
      }
      renderTreeView();
      return;
    }

    // 2. 点击进入编辑
    const editBtn = e.target.closest(".btn-tree-edit");
    if (editBtn) {
      e.stopPropagation();
      state.editingItemId = editBtn.dataset.id;
      renderTreeView();
      return;
    }

    // 3. 取消编辑
    const cancelBtn = e.target.closest(".btn-inline-cancel");
    if (cancelBtn) {
      e.stopPropagation();
      state.editingItemId = null;
      renderTreeView();
      return;
    }

    // 4. 保存编辑
    const saveBtn = e.target.closest(".btn-inline-save");
    if (saveBtn) {
      e.stopPropagation();
      const id = saveBtn.dataset.id;
      const targetItem = state.ledgerItems.find((i) => i.id === id);
      if (!targetItem) return;

      const titleInput = document.getElementById(`inlineTitle_${id}`);
      const pathInput = document.getElementById(`inlinePath_${id}`);
      const urlInput = document.getElementById(`inlineUrl_${id}`);

      const newTitle = titleInput ? titleInput.value.trim() : targetItem.newTitle;
      const newPath = pathInput ? pathInput.value.trim() : targetItem.newPath;
      const newUrl = urlInput ? urlInput.value.trim() : targetItem.newUrl;

      // URL 格式校验保护
      if (newUrl && !newUrl.startsWith("http://") && !newUrl.startsWith("https://") && !newUrl.startsWith("chrome://")) {
        alert("请输入以 http:// 或 https:// 开头的合法有效网址！");
        return;
      }

      targetItem.newTitle = newTitle || targetItem.oldTitle;
      targetItem.newPath = newPath || targetItem.oldPath;
      targetItem.newUrl = newUrl || targetItem.oldUrl;

      const isTitleChanged = targetItem.newTitle !== targetItem.oldTitle;
      const isPathChanged = targetItem.newPath !== targetItem.oldPath;
      const isUrlChanged = Boolean(targetItem.newUrl && targetItem.newUrl !== targetItem.oldUrl);
      const isDelete = targetItem.action === "delete";

      targetItem.isUrlChanged = isUrlChanged;
      targetItem.hasChange = isTitleChanged || isPathChanged || isUrlChanged || isDelete;

      let opType = "keep";
      if (isDelete) opType = "delete";
      else if (isUrlChanged) opType = "url_fix";
      else if (isTitleChanged && isPathChanged) opType = "both";
      else if (isPathChanged) opType = "move";
      else if (isTitleChanged) opType = "rename";
      targetItem.opType = opType;
      targetItem.reason = `用户手动编辑修改`;

      // 实时追加新输入目录到 datalist
      if (newPath && !state.folderMap.has(newPath)) {
        const opt = document.createElement("option");
        opt.value = newPath;
        dom.folderPathDatalist.appendChild(opt);
      }

      state.editingItemId = null;
      log(`[手动编辑] ID=${targetItem.id}: "${targetItem.newTitle}" | 目录: "${targetItem.newPath}"`, "ok");
      renderDiffTable();
      return;
    }

    // 5. 恢复原始状态
    const resetBtn = e.target.closest(".btn-inline-reset");
    if (resetBtn) {
      e.stopPropagation();
      const id = resetBtn.dataset.id;
      const targetItem = state.ledgerItems.find((i) => i.id === id);
      if (!targetItem) return;

      targetItem.newTitle = targetItem.oldTitle;
      targetItem.newPath = targetItem.oldPath;
      targetItem.newUrl = targetItem.oldUrl;
      targetItem.isUrlChanged = false;
      targetItem.hasChange = false;
      targetItem.opType = "keep";
      targetItem.selected = false;
      targetItem.reason = "已恢复为原始书签状态";

      state.editingItemId = null;
      log(`[恢复原始] ID=${targetItem.id}: "${targetItem.oldTitle}"`, "warn");
      renderDiffTable();
      return;
    }
  });

  // 监听双栏树复选框联动
  container.addEventListener("change", (e) => {
    const cb = e.target.closest(".tree-item-cb");
    if (cb) {
      const id = cb.dataset.id;
      const targetItem = state.ledgerItems.find((i) => i.id === id);
      if (targetItem) {
        targetItem.selected = cb.checked;
        const selCount = state.ledgerItems.filter((i) => i.selected).length;
        dom.stSelected.textContent = selCount;
        dom.applyChangesBtn.disabled = selCount === 0;
        const tableCb = dom.diffTableBody.querySelector(`.item-cb[data-id="${id}"]`);
        if (tableCb) tableCb.checked = cb.checked;
        renderTreeView();
      }
    }
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ================= 执行变更与备份 =================

async function exportFullBackup() {
  try {
    setProgress(5, "正在导出 Chrome 书签完整快照...");
    const tree = await chrome.bookmarks.getTree();
    const jsonStr = JSON.stringify(tree, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const timeStr = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `chrome_bookmarks_backup_${timeStr}.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setProgress(100, "书签快照已成功下载到本地！", "备份成功");
    log(`[备份成功] 已安全导出书签备份至 ${filename}`, "ok");
  } catch (err) {
    setProgress(0, "导出失败", "错误");
    log(`[备份失败] ${err.message}`, "err");
  }
}

async function applySelectedChanges() {
  const selectedOps = state.ledgerItems.filter((i) => i.selected);
  if (selectedOps.length === 0) {
    alert("请至少勾选一项待执行的变更！");
    return;
  }

  const confirmMsg = `即将执行 ${selectedOps.length} 项书签变更到 Chrome 真实书签库中！\n是否确认执行？（建议执行前先点击导出快照备份）`;
  if (!confirm(confirmMsg)) return;

  log(`⚡ 开始执行变更: 共 ${selectedOps.length} 项选中任务`);
  setProgress(0, "正在应用变更...", `0 / ${selectedOps.length}`);

  dom.applyChangesBtn.disabled = true;
  dom.startAiBtn.disabled = true;
  dom.scanBtn.disabled = true;

  let successCount = 0;
  let failCount = 0;

  try {
    for (let i = 0; i < selectedOps.length; i++) {
      const item = selectedOps[i];
      const pct = (((i + 1) / selectedOps.length) * 100).toFixed(1);

      try {
        if (item.action === "delete") {
          await chrome.bookmarks.remove(item.id);
          log(`[删除] 成功删除无效书签: "${item.oldTitle}" (ID: ${item.id})`, "ok");
          successCount++;
          continue;
        }

        const isTitleChanged = item.newTitle !== item.oldTitle;
        const isUrlChanged = item.isUrlChanged;
        const isPathChanged = item.newPath !== item.oldPath;

        if (isTitleChanged || isUrlChanged) {
          const updatePayload = {};
          if (isTitleChanged) updatePayload.title = item.newTitle;
          if (isUrlChanged) updatePayload.url = item.newUrl;
          await chrome.bookmarks.update(item.id, updatePayload);
          log(`[更新] ID=${item.id}: 标题/URL 净化更新成功`, "ok");
        }

        if (isPathChanged) {
          const targetFolderNode = await ensureFolder(item.newPath, state.folderMap);
          await chrome.bookmarks.move(item.id, { parentId: targetFolderNode.id });
          log(`[移动] ID=${item.id}: 已移动到 "${item.newPath}"`, "ok");
        }

        successCount++;
      } catch (err) {
        failCount++;
        log(`[失败] 处理书签 ID=${item.id} 发生错误: ${err.message}`, "err");
      }

      setProgress(pct, `正在执行: [${i + 1}/${selectedOps.length}]`, `${i + 1} / ${selectedOps.length}`);
    }

    log(`🎉 变更批处理完成: 成功 ${successCount} 项, 失败 ${failCount} 项`, successCount > 0 ? "ok" : "warn");
    alert(`执行完毕！成功处理 ${successCount} 项书签${failCount > 0 ? `，失败 ${failCount} 项（详情见日志）` : ""}。`);

    // 重新扫描刷新状态
    await scanBookmarks();
  } finally {
    dom.startAiBtn.disabled = false;
    dom.scanBtn.disabled = false;
    dom.applyChangesBtn.disabled = state.ledgerItems.filter((i) => i.selected).length === 0;
  }
}

// ================= 事件与初始化绑定 =================

function initEventHandlers() {
  // Tab 导航
  dom.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      dom.tabs.forEach((t) => t.classList.remove("active"));
      dom.tabContents.forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      const targetId = tab.dataset.tab;
      document.getElementById(targetId).classList.add("active");
    });
  });

  // 引擎模式切换
  dom.btnModeWeb.addEventListener("click", () => switchEngineMode("web_session"));
  dom.btnModeApi.addEventListener("click", () => switchEngineMode("api"));

  // 网页版卡片切换
  dom.cardWebDeepSeek.addEventListener("click", () => {
    state.webProvider = "deepseek";
    dom.cardWebDeepSeek.classList.add("active");
    dom.cardWebChatGPT.classList.remove("active");
    updateConnIndicator();
    saveSettings();
  });
  dom.cardWebChatGPT.addEventListener("click", () => {
    state.webProvider = "chatgpt";
    dom.cardWebChatGPT.classList.add("active");
    dom.cardWebDeepSeek.classList.remove("active");
    updateConnIndicator();
    saveSettings();
  });

  // 网页会话检测与连接
  dom.btnOpenWebTab.addEventListener("click", () => detectOrOpenWebSession(true));
  dom.btnPingBridge.addEventListener("click", () => detectOrOpenWebSession(false));

  // 密码显隐
  dom.toggleKeyBtn.addEventListener("click", () => {
    const isPass = dom.cfgApiKey.type === "password";
    dom.cfgApiKey.type = isPass ? "text" : "password";
    dom.toggleKeyBtn.textContent = isPass ? "隐藏" : "显示";
  });

  // 保存 API 设置
  dom.saveSettingsBtn.addEventListener("click", async () => {
    await saveSettings();
    alert("API 接口配置已成功保存！");
    log("配置已更新并持久化至本地沙箱。", "ok");
  });

  // 恢复默认设置
  dom.resetSettingsBtn.addEventListener("click", () => {
    if (!confirm("确定恢复默认接口配置吗？")) return;
    dom.cfgBaseUrl.value = "https://api.xiaomimimo.com/v1";
    dom.cfgApiKey.value = "";
    dom.cfgModel.value = "mimo-v2.6-flash";
    dom.cfgBatchSize.value = "20";
    dom.cfgTemperature.value = "0.2";
    dom.cfgJsonMode.checked = true;
    saveSettings();
  });

  // 测试接口连通性
  dom.testConnBtn.addEventListener("click", async () => {
    const baseUrl = dom.cfgBaseUrl.value.trim();
    const apiKey = dom.cfgApiKey.value.trim();
    const model = dom.cfgModel.value.trim();

    if (!baseUrl) {
      alert("请填写 API Base URL！");
      return;
    }

    dom.testConnBtn.disabled = true;
    dom.testResultMsg.textContent = "正在探测接口...";
    dom.testResultMsg.style.color = "var(--text-muted)";

    const res = await window.AiClient.testConnection({ baseUrl, apiKey, model });
    dom.testConnBtn.disabled = false;

    if (res.ok) {
      dom.testResultMsg.textContent = `✅ 连通正常！延时 ${res.elapsed}ms，模型: ${res.model}`;
      dom.testResultMsg.style.color = "var(--green)";
      log(`接口连通性测试通过 [HTTP ${res.status}] 延时: ${res.elapsed}ms, 模型: ${res.model}`, "ok");
      updateConnIndicator();
    } else {
      dom.testResultMsg.textContent = `❌ 测试失败: ${res.error}`;
      dom.testResultMsg.style.color = "var(--red)";
      log(`接口连通测试失败: ${res.error}`, "err");
    }
  });

  // 提示词面板：切换预设时做脏状态保护
  dom.presetSelect.addEventListener("change", (e) => {
    const curKey = state.config.currentPreset || "deep_refactor";
    const saved = state.config.prompts?.[curKey] || PRESETS[curKey];
    const isDirty = dom.promptSystem.value !== (saved?.system || "") || dom.promptUser.value !== (saved?.user || "");
    if (isDirty) {
      if (!confirm("当前预设的提示词已修改但尚未保存，切换将丢失改动。是否继续切换？")) {
        dom.presetSelect.value = curKey;
        return;
      }
    }
    state.config.currentPreset = e.target.value;
    loadPresetIntoUI(e.target.value);
  });

  dom.resetPresetBtn.addEventListener("click", () => {
    const presetKey = dom.presetSelect.value;
    const defaults = PRESETS[presetKey] || PRESETS.deep_refactor;
    dom.promptSystem.value = defaults.system;
    dom.promptUser.value = defaults.user;
    dom.promptStatusMsg.textContent = "已恢复此预设官方默认模板";
    setTimeout(() => (dom.promptStatusMsg.textContent = ""), 2500);
  });

  dom.savePromptBtn.addEventListener("click", async () => {
    await saveSettings();
    dom.promptStatusMsg.textContent = "✅ 提示词模板已保存！";
    setTimeout(() => (dom.promptStatusMsg.textContent = ""), 2500);
  });

  // 单价设置变更即时重新计算并持久化
  const onPriceChange = () => {
    const inRate = parseFloat(dom.priceInputRate.value);
    const outRate = parseFloat(dom.priceOutputRate.value);
    const cRate = parseFloat(dom.priceCacheRate.value);
    state.pricing.inputRate = Number.isFinite(inRate) && inRate >= 0 ? inRate : 0.5;
    state.pricing.outputRate = Number.isFinite(outRate) && outRate >= 0 ? outRate : 1.5;
    state.pricing.cacheRate = Number.isFinite(cRate) && cRate >= 0 ? cRate : 0.1;
    state.pricing.currency = dom.priceCurrency.value || "¥";
    updateTokenDisplay();
    chrome.storage.local.set({
      ai_bookmark_meta: {
        engineMode: state.engineMode,
        webProvider: state.webProvider,
        pricing: state.pricing,
      },
    });
  };
  dom.priceInputRate.addEventListener("input", onPriceChange);
  dom.priceOutputRate.addEventListener("input", onPriceChange);
  dom.priceCacheRate.addEventListener("input", onPriceChange);
  dom.priceCurrency.addEventListener("change", onPriceChange);

  // 作用域下拉变更
  dom.scopeFolderSelect.addEventListener("change", () => {
    updateSelectedScopeItems();
    renderTreeView();
  });

  // 工作台按钮
  dom.scanBtn.addEventListener("click", () => scanBookmarks());
  dom.startAiBtn.addEventListener("click", () => startAiAnalysis());
  dom.stopAiBtn.addEventListener("click", () => stopAiAnalysis());
  dom.backupBtn.addEventListener("click", () => exportFullBackup());
  dom.applyChangesBtn.addEventListener("click", () => applySelectedChanges());

  // 双保险免 API 辅助按钮
  dom.btnGrabWebReply.addEventListener("click", () => grabWebReplyDirectly());
  dom.btnCopyCurrentPrompt.addEventListener("click", () => copyCurrentBatchPrompt());
  dom.btnPasteWebReply.addEventListener("click", () => pasteWebReplyManually());

  // 视图切换
  dom.btnViewTable.addEventListener("click", () => switchDiffView("table"));
  dom.btnViewTree.addEventListener("click", () => switchDiffView("tree"));

  // 树搜索
  dom.treeSearchInput.addEventListener("input", (e) => {
    state.treeSearchKeyword = e.target.value.trim();
    renderTreeView();
  });

  dom.btnExpandAllTrees.addEventListener("click", () => {
    state.collapsedFolders.clear();
    renderTreeView();
  });

  dom.btnCollapseAllTrees.addEventListener("click", () => {
    const allPaths = Array.from(state.folderMap.keys());
    for (const p of allPaths) state.collapsedFolders.add(p);
    state.collapsedFolders.add("书签栏/🗑️ 已建议删除");
    renderTreeView();
  });

  // 挂载双栏树容器事件委托
  setupTreeEventDelegation();

  // 账本过滤器
  dom.filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      dom.filterChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state.currentFilter = chip.dataset.filter;
      renderDiffTable();
    });
  });

  // 勾选操作
  dom.btnSelectAll.addEventListener("click", () => {
    state.ledgerItems.forEach((i) => (i.selected = true));
    renderDiffTable();
  });

  dom.btnDeselectAll.addEventListener("click", () => {
    state.ledgerItems.forEach((i) => (i.selected = false));
    renderDiffTable();
  });

  dom.btnSelectChangedOnly.addEventListener("click", () => {
    state.ledgerItems.forEach((i) => (i.selected = i.hasChange));
    renderDiffTable();
  });

  // Master Checkbox：只作用于当前过滤可见的条目
  dom.masterCheckbox.addEventListener("change", (e) => {
    const checked = e.target.checked;
    const filter = state.currentFilter;
    let visibleItems = state.ledgerItems;
    if (filter === "changed") visibleItems = visibleItems.filter((i) => i.hasChange);
    else if (filter === "url_fix") visibleItems = visibleItems.filter((i) => i.isUrlChanged);
    else if (filter === "move") visibleItems = visibleItems.filter((i) => i.opType === "move" || i.opType === "both");
    else if (filter === "rename") visibleItems = visibleItems.filter((i) => i.opType === "rename" || i.opType === "both");
    else if (filter === "delete") visibleItems = visibleItems.filter((i) => i.opType === "delete");

    visibleItems.forEach((i) => (i.selected = checked));
    renderDiffTable();
  });

  // 日志按钮
  dom.copyLogBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(dom.logBox.textContent);
    alert("日志已复制到剪贴板！");
  });

  dom.clearLogBtn.addEventListener("click", () => {
    dom.logBox.textContent = "";
  });
}

// 页面初始化
document.addEventListener("DOMContentLoaded", async () => {
  initEventHandlers();
  await loadSettings();
  await scanBookmarks();
  // 页面加载时静默探测一次网页会话状态
  detectOrOpenWebSession(false);
});
