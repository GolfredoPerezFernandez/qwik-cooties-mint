import type { QwikIntrinsicElements } from '@builder.io/qwik';
import { $, component$, noSerialize, useSignal, useStore, useStyles$, useVisibleTask$, useTask$ } from '@builder.io/qwik';

import type { DocumentHead } from '@builder.io/qwik-city';
import {  ethers } from 'ethers';
import { Slider } from "qwik-slider";

import { Application } from '@splinetool/runtime';
import { mintAbi } from '~/abis/mintAbi';
import { Modal } from '@qwik-ui/headless';
import styles from '../snippets/animation.css?inline';
type NFTJSON = string[];
interface Metadata{
  name:string;
  tokenId:string;
  image:string;
  description:string;
  attributes:any
}
type NFTMetadata = Metadata[];

declare global {
  interface Window {
    ethereum: any
  }
}

export default component$(() => {
  useStyles$(styles);

  const isWeb3Avaliable = useSignal<any>(false);
  const isLoading = useSignal<any>(false);
  const loadingText = useSignal<any>("");

  const nftsMetadata = useSignal<NFTJSON>([]);
  const nftsMetadataJSON = useStore<NFTMetadata>([]);
  const freeMints = useSignal<number>(0);
  
  const state = useStore({
    inputValue:''
  });

  
  const userAccount = useSignal<any>(undefined);
const web3provider = useSignal<any>(undefined);
const showSig = useSignal<boolean>(false);
const checkMetamaskInstallation = $(async () => {   

    if (window.ethereum == undefined) {
        alert("Metamask wallet is not installed");
        return false;
    } else{
      return true
    }   
});

const initiateWalletConnection = $(async () => {
  
try {
    const provider=noSerialize( new ethers.BrowserProvider(window.ethereum))
if(provider){

  const accounts = await provider.send("eth_requestAccounts", []);
  const account = accounts[0];
  web3provider.value=provider;
  userAccount.value=account;

}

} catch (error) {
  console.log(error);}
});
const switchToFlare = $(async () => {

  try {
      const provider = new ethers.BrowserProvider( window.ethereum);
      await provider.send("wallet_switchEthereumChain", [
          { chainId: "0x13" },
      ]);
  } catch (error:any) {
      if (error.code === 4902) {
          await addFlare();
      } else {
          console.log(error);
      }
  }
});

const addFlare = $(async () => {

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("wallet_addEthereumChain", [
      {
          chainId: "0xe",
          chainName: "Flare",
          nativeCurrency: {
              name: "FLR",
              symbol: "FLR",
              decimals: 18,
          },
          rpcUrls: ["https://flare-api.flare.network/ext/C/rpc"],
          blockExplorerUrls: ["https://flare-explorer.flare.network/"],
      },
  ])
});  
const mintAddress = "0xDeC023Bb7FbC90Fe6211716d10261cE9EEb294C7";
useTask$(async ({ track }) => {
  track(() => userAccount.value); // Re-run this task if userAccount.value changes
  if (userAccount.value) {
    try {
   
      const provider = new ethers.BrowserProvider( window.ethereum);
      const contract = new ethers.Contract(
        "0xDeC023Bb7FbC90Fe6211716d10261cE9EEb294C7",
        mintAbi,
        provider
      );
      const freeMintsAvailable = await contract.freeMints(userAccount.value);
      freeMints.value = parseInt(freeMintsAvailable, 10);
    } catch (error) {
      console.error('Error fetching free mints:', error);
    }
  }
});
useTask$(async ({ track }) => {
  track(() => userAccount.value); // Re-run this task if userAccount.value changes
  if (userAccount.value) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        "0xDeC023Bb7FbC90Fe6211716d10261cE9EEb294C7",
        mintAbi,
        provider
      );
      const freeMintsAvailable = await contract.freeMints(userAccount.value);
      freeMints.value = parseInt(freeMintsAvailable, 10);
    } catch (error) {
      console.error('Error fetching free mints:', error);
    }
  }
});


useVisibleTask$(async ()=>{

  const canvas:any = document.getElementById('canvas3d');
  const spline = new Application(canvas);
  spline.load('https://prod.spline.design/REAVPvrfrE-wHdgZ/scene.splinecode',
	{
		credentials: 'include',
		mode: 'no-cors',
	}).then( () => {
    spline.addEventListener('mouseDown', async (e) => {
    try{
    
      isLoading.value=true

    if(!userAccount.value){
      await initiateWalletConnection()
    } 

    await switchToFlare()
    if(web3provider&&web3provider.value){
      const signer = await web3provider.value.getSigner();

      const mintContract = new ethers.Contract(mintAddress, mintAbi,signer );
      if (e.target.name === 'Button-Primary Instance') {  
          const mintAmount=parseInt(state.inputValue)
          const ethPrice=1
          const totalCostInEther = (ethPrice * mintAmount).toString(); // Total cost in Ether
          const totalCostInWei = ethers.parseUnits(totalCostInEther, "ether"); // Convert to Wei
          loadingText.value='Minting '+state.inputValue+' Lil Cooties..'
        
          const res = await mintContract.mintWithFLR(userAccount.value, mintAmount, {value: totalCostInWei});
        
          loadingText.value='Waiting blockchain confirmation..'
          const response = await res.wait();
const nftList=[]
const hexToDecimal = (hex:string) => parseInt(hex, 16);
for(let i=0;i<mintAmount;i++){

  const nftId = hexToDecimal(response.logs[i].topics[3]);
  nftList.push(nftId)
}

    if(response){

      const nftBalance = await mintContract.balanceOf(userAccount.value);
      console.log("nftBalance "+nftBalance)
      loadingText.value='Collecting NFT Info..'

      isLoading.value=false

      showSig.value=true
    for(let i=0;i<nftList.length;i++){

      const metadata = await mintContract.tokenURI(nftList[i]);

    
      nftsMetadata.value.push(metadata)
      const response = await fetch(metadata);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const metadataJSON = await response.json();

      nftsMetadataJSON.push({
        name:metadataJSON.name,
        description:metadataJSON.description,    
        attributes:metadataJSON.attributes,    
        tokenId:metadataJSON.name,
        image:metadataJSON.image})
    }
    }

    } else if(e.target.name === 'Button-Danger' ){
      console.log('I have been clicked Danger!');
     
      await mintContract.freeMint(1);
      
    isLoading.value=false
    }
    }
    loadingText.value=''

  } catch(e:any){
    isLoading.value=false
    loadingText.value=''

    console.log(e.message)
  }
    
  });
  });
  if(await checkMetamaskInstallation()){
    isWeb3Avaliable.value=true
     
  }else{
    isWeb3Avaliable.value=false

  }
})
const handleChange=$((e:any)=>{
  state.inputValue=e.target.value
})

const sliderSettings = {
  scrollSpeed: 5,
  gap: 20,
  showScrollbar: false,
  autoScroll: true,
  autoScrollSpeed: 10,
}
  return (
    <>
       <canvas style={{width:"100%",height: "100%",justifyContent:"center",alignItems:"center",position:"fixed",zIndex:-1}} id="canvas3d" />
       
       <span class="responsive-text">
  Free Mints Available: {freeMints.value.toString()}
</span>

<h4 style={{color:'white'}}>{userAccount.value}</h4>

<h4 style={{color:'white'}}>{loadingText.value}</h4>


    <div class="flex-1 items-center  mt-[380px] justify-center">

    {isLoading.value?<div class={'max-w-sm mx-auto justify-center pl-[180px] items-center'} role="status">
    <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-pink-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
</div>:
<form class="max-w-sm mx-auto " style="  "> {/* Adjust the padding-top value to move the input box down */}
  <input type="number" id="number-input" onChange$={handleChange} aria-describedby="helper-text-explanation" class="bg-transparent border border-gray-300 text-white-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="# of NFTs" required />
</form>}
</div>
<Modal
        bind:show={showSig}
        class="my-animation pt-16 shadow-dark-medium bg-background text-foreground max-w-[50rem] rounded-md p-[28px] backdrop:backdrop-blur backdrop:backdrop-brightness-50 dark:backdrop:backdrop-brightness-100"
      >
<Slider {...sliderSettings}>
{nftsMetadataJSON.map((item, index) => (

  <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <a key={index} href="#">
        <img class="rounded-t-lg" height={300} width={240} src={item.image} alt="" />
    </a>
    <div class="p-5">
        <a key={index} href="#">
            <h6 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{"Cootie "+item.name}</h6>
        </a>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">{JSON.stringify(item.attributes).toString()}</p>
       
    </div>
</div>
  ))}

    </Slider>
      </Modal>


   
   
    </>
  );
});

export function CloseIcon(props: QwikIntrinsicElements['svg'], key: string) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props} key={key}>
      <path
        fill="currentColor"
        d="m12 13.4l2.9 2.9q.275.275.7.275t.7-.275q.275-.275.275-.7t-.275-.7L13.4 12l2.9-2.9q.275-.275.275-.7t-.275-.7q-.275-.275-.7-.275t-.7.275L12 10.6L9.1 7.7q-.275-.275-.7-.275t-.7.275q-.275.275-.275.7t.275.7l2.9 2.9l-2.9 2.9q-.275.275-.275.7t.275.7q.275.275.7.275t.7-.275l2.9-2.9Zm0 8.6q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20Zm0-8Z"
      ></path>
    </svg>
  );
}

export const head: DocumentHead = {
  title: 'Lil Cooties',
  meta: [
    {
      name: 'LilCootiesMint',
      content: 'Mint a Little Cootie',
    },
  ],
};