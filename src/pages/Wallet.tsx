import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Loader2,
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  Lock
} from "lucide-react";
import { useWalletBalance, useTransactions, useDeposit, useWithdraw } from "@/hooks/use-wallet";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { useCurrentUser } from "@/hooks/use-auth";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { format } from "date-fns";
import { toast } from "sonner";

const Wallet = () => {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isFetchingSol, setIsFetchingSol] = useState(false);

  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({ limit: 50 });
  const depositMutation = useDeposit();
  const withdrawMutation = useWithdraw();
  const { connected, address, getBalance, sendSOL, connection } = useSolanaWallet();
  const { data: currentUser } = useCurrentUser();

  // Fetch SOL balance from wallet
  const fetchSolBalance = async () => {
    if (!connected || !getBalance) {
      setSolBalance(null);
      return;
    }

    setIsFetchingSol(true);
    try {
      const sol = await getBalance();
      setSolBalance(sol);
    } catch (error) {
      console.error("Error fetching SOL balance:", error);
      setSolBalance(null);
    } finally {
      setIsFetchingSol(false);
    }
  };

  // Fetch SOL balance when wallet connects
  useEffect(() => {
    if (connected) {
      fetchSolBalance();
      // Refresh every 10 seconds when connected
      const interval = setInterval(fetchSolBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [connected]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!connected || !address) {
      toast.error("Please connect your Solana wallet first");
      return;
    }

    if (!txHash) {
      toast.error("Please provide the transaction hash from your on-chain deposit");
      return;
    }

    try {
      await depositMutation.mutateAsync({
        amount: parseFloat(depositAmount),
        txHash: txHash.trim(),
      });
      setDepositAmount("");
      setTxHash("");
      refetchBalance();
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!connected || !address) {
      toast.error("Please connect your Solana wallet first");
      return;
    }

    if (!balance || parseFloat(withdrawAmount) > balance.availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      await withdrawMutation.mutateAsync({
        amount: parseFloat(withdrawAmount),
      });
      setWithdrawAmount("");
      refetchBalance();
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  const getSolanaExplorerUrl = (txHash: string) => {
    const network = import.meta.env.VITE_SOLANA_NETWORK || "mainnet-beta";
    const cluster = network === "mainnet-beta" ? "" : `?cluster=${network}`;
    return `https://explorer.solana.com/tx/${txHash}${cluster}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case "withdraw":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "win":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "bet":
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
      case "pending":
        return <Clock className="h-3.5 w-3.5 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <WalletIcon className="h-8 w-8 text-primary" />
            Wallet
          </h1>
          <p className="text-muted-foreground">Manage your funds and transactions</p>
        </div>

        {/* Wallet Connection Status */}
        {connected && address && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Wallet Connected</div>
                    <div className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                      {address.slice(0, 8)}...{address.slice(-8)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={copyAddress}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                {solBalance !== null && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Wallet Balance</div>
                    <div className="text-lg font-bold">{solBalance.toFixed(4)} SOL</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!connected && (
          <Card className="mb-6 border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-yellow-600">
                    <Clock className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Wallet Not Connected</div>
                      <div className="text-sm">Connect your Solana wallet to deposit and withdraw funds</div>
                    </div>
                  </div>
                  <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-primary-foreground" />
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/50">
                  <div className="font-medium mb-1">Having connection issues?</div>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Make sure your wallet extension is installed and unlocked</li>
                    <li>Try refreshing the page and connecting again</li>
                    <li>If using Phantom, try disconnecting and reconnecting</li>
                    <li>Check that your wallet extension is up to date</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Balance Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Available Balance
              </CardDescription>
              <CardTitle className="text-3xl">
                {balanceLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  `$${balance?.availableBalance.toFixed(2) || "0.00"}`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Total: ${balance?.totalBalance.toFixed(2) || "0.00"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Points Balance
              </CardDescription>
              <CardTitle className="text-3xl text-primary">
                {balanceLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  `${balance?.points?.toFixed(0) || "0"}`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Available: {balance?.availablePoints?.toFixed(0) || "0"} pts
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Locked in Orders
              </CardDescription>
              <CardTitle className="text-3xl">
                {balanceLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  `$${balance?.lockedInOrders.toFixed(2) || "0.00"}`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Pending bets
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Active Positions
              </CardDescription>
              <CardTitle className="text-3xl">
                {balanceLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  `$${balance?.activePositions.toFixed(2) || "0.00"}`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Current market value
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Total Winnings
              </CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {balanceLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  `$${balance?.totalWinnings.toFixed(2) || "0.00"}`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                All time profits
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownLeft className="h-5 w-5 text-green-500" />
                  Deposit Funds
                </CardTitle>
                <CardDescription>
                  {connected 
                    ? "Deposit SOL on-chain, then provide the transaction hash below"
                    : "Connect your Solana wallet to deposit funds"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!connected && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm">
                    Please connect your Solana wallet first to deposit funds.
                  </div>
                )}

                {connected && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Amount (USD)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        step="0.01"
                        min="0.01"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deposit SOL equivalent to this USD amount
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Transaction Hash</label>
                      <Input
                        type="text"
                        placeholder="Enter transaction hash from your deposit"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        After depositing SOL on-chain via the smart contract, paste the transaction hash here
                      </p>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={handleDeposit}
                      disabled={depositMutation.isPending || !depositAmount || !txHash}
                    >
                      {depositMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ArrowDownLeft className="h-4 w-4 mr-2" />
                          Verify Deposit
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                  Withdraw Funds
                </CardTitle>
                <CardDescription>
                  {connected 
                    ? "Withdraw funds to your connected Solana wallet"
                    : "Connect your Solana wallet to withdraw funds"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!connected && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm">
                    Please connect your Solana wallet first to withdraw funds.
                  </div>
                )}

                {connected && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Amount (USD)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        step="0.01"
                        min="0.01"
                        max={balance?.availableBalance}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          Available: ${balance?.availableBalance.toFixed(2) || "0.00"}
                        </p>
                        {balance && parseFloat(withdrawAmount) > balance.availableBalance && (
                          <p className="text-xs text-red-500">Insufficient balance</p>
                        )}
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleWithdraw}
                      disabled={withdrawMutation.isPending || !withdrawAmount || !balance || parseFloat(withdrawAmount) > balance.availableBalance}
                    >
                      {withdrawMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Withdraw
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Withdrawal will be executed on-chain. In blockchain mode, admin will sign the transaction.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>Your complete transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading transactions...</p>
                  </div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between py-3 px-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(tx.type)}
                          <div>
                            <div className="font-medium capitalize flex items-center gap-2">
                              {tx.type}
                              {getStatusIcon(tx.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(tx.date)}
                            </div>
                            {tx.description && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {tx.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <div 
                              className={`font-semibold ${
                                (typeof tx.amount === 'string' ? tx.amount.startsWith('-') : tx.amount < 0) 
                                  ? 'text-red-600' 
                                  : 'text-green-600'
                              }`}
                            >
                              {typeof tx.amount === 'string' 
                                ? tx.amount 
                                : `${tx.amount >= 0 ? '+' : ''}${tx.amount.toFixed(2)}`
                              }
                            </div>
                            <Badge 
                              variant={
                                tx.status === "completed" ? "default" :
                                tx.status === "pending" ? "secondary" : "destructive"
                              }
                              className="text-xs mt-1"
                            >
                              {tx.status}
                            </Badge>
                          </div>
                          {(tx.txHash || tx.description?.includes("txHash")) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const hash = tx.txHash || tx.description?.match(/txHash[:\s]+([A-Za-z0-9]{88})/)?.[1] || tx.description?.match(/txHash[:\s]+([A-Za-z0-9]{64})/)?.[1];
                                if (hash) {
                                  window.open(getSolanaExplorerUrl(hash), "_blank");
                                }
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No transactions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Wallet;
