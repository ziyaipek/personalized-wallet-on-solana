const fs = require('fs');
const web3 = require('@solana/web3.js');
const { get } = require('http');

class Wallet {
  constructor() {
    this.wallets = [];
    this.currentWallet = null;
  }

  new() {
    const connection = new web3.Connection('https://api.devnet.solana.com', 'confirmed');
    const keypair = web3.Keypair.generate();

    const wallet = {
      address: keypair.publicKey.toBase58(),
      balance: 0,
      keypair,
    };

    this.wallets.push(wallet);
    this.currentWallet = wallet;

    this.save();

    console.log('New wallet created and set as the current wallet:');
    console.log(wallet);

    return wallet;
  }

  switch(walletIndex) {
    if (walletIndex >= 0 && walletIndex < this.wallets.length) {
      this.currentWallet = this.wallets[walletIndex];
      console.log(`Switched to wallet at index ${walletIndex}:`);
      console.log(this.currentWallet);
    } else {
      console.error('Invalid wallet index.');
    }
  }

  save() {
    fs.writeFileSync('wallets.json', JSON.stringify(this.wallets, null, 2));
  }

  load() {
    try {
      const data = fs.readFileSync('wallets.json', 'utf-8');
      this.wallets = JSON.parse(data);
      if (this.wallets.length > 0) {
        this.currentWallet = this.wallets[0];
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  }

  async airdrop(amount = 1) {
    if (this.currentWallet) {
      try {
        const connection = new web3.Connection('https://api.devnet.solana.com', 'confirmed');
        const publicKey = new web3.PublicKey(this.currentWallet.address);

        await connection.requestAirdrop(publicKey, web3.LAMPORTS_PER_SOL * amount);
        await connection.confirmTransaction(publicKey);

        this.currentWallet.balance += amount;
        this.saveWallets();

        console.log(`${amount} SOL airdropped to the current wallet.`);
        console.log(`Updated Balance: ${this.currentWallet.balance} SOL`);
      } catch (error) {
        console.error('Airdrop failed:', error);
      }
    } else {
      console.error('No wallet found. Create a wallet first.');
    }
  }

  async balance() {
    if (this.currentWallet) {
      try {
        const connection = new web3.Connection('https://api.devnet.solana.com', 'confirmed');
        const publicKey = new web3.PublicKey(this.currentWallet.address);

        const balance = await connection.getBalance(publicKey);
        this.currentWallet.balance = balance / web3.LAMPORTS_PER_SOL;
  
        console.log(`Current Wallet Address: ${this.currentWallet.address}`);
        console.log(`Balance: ${this.currentWallet.balance} SOL`);
      } catch (error) {
        console.error('Balance check failed:', error);
      }
    } else {
      console.error('No wallet found. Create a wallet first.');
    }
  }

  async transfer(otherPublicKey, amount) {
    if (this.currentWallet) {
      try {
        const connection = new web3.Connection('https://api.devnet.solana.com', 'confirmed');
        const fromPublicKey = new web3.PublicKey(this.currentWallet.address);
        const toPublicKey = new web3.PublicKey(otherPublicKey);

        const transaction = new web3.Transaction().add(
          web3.SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: toPublicKey,
            lamports: web3.LAMPORTS_PER_SOL * amount,
          })
        );

        const signature = await web3.sendAndConfirmTransaction(connection, transaction, [this.currentWallet.keypair]);

        console.log(`Successfully transferred ${amount} SOL to ${otherPublicKey}`);
        console.log(`Transaction Signature: ${signature}`);

        if (amount > 5) {
          this.sendNotification(`You received a transfer of ${amount} SOL.`);
        }
      } catch (error) {
        console.error('Transfer failed:', error);
      }
    } else {
      console.error('No wallet found. Create a wallet first.');
    }
  }

  sendNotification(message) {
    console.log(`Notification: ${message}`);
  }
}

  async function getNetworkStats() {
    try {
      const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
  
      const epochInfo = await connection.getEpochInfo();
      const blockHeight = epochInfo.absoluteSlot;
      
      const transactionCount = await connection.getBlockTime(blockHeight);
      
      console.log(`Current Block Height: ${blockHeight}`);
      console.log(`Total Transactions in Current Block: ${transactionCount}`);
    } catch (error) {
      console.error('Failed to get network stats:', error);
    }
  }

  const wallet = new Wallet();
  wallet.load();
  wallet.new();

  getNetworkStats();
  
 
 
 

