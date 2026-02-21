import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSignIn, useSignUp } from "@/hooks/use-auth";
import { useUsernameCheck } from "@/hooks/use-username-check";
import { useEmailCheck } from "@/hooks/use-email-check";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { authApi } from "@/api/auth";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Check, X, Loader2, ArrowRight, ArrowLeft, Wallet } from "lucide-react";
import bs58 from "bs58";
import { toast } from "sonner";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState<string | undefined>(undefined);
  const [signupStep, setSignupStep] = useState<"email" | "username" | "password">("email");
  const [walletSignupStep, setWalletSignupStep] = useState<"connect" | "username">("connect");
  const [isWalletSigning, setIsWalletSigning] = useState(false);
  const { signIn: setSignedIn } = useAuth();
  const navigate = useNavigate();
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const { isChecking: isCheckingEmail, isAvailable: isEmailAvailable, message: emailMessage } = useEmailCheck(email);
  const { isChecking: isCheckingUsername, isAvailable: isUsernameAvailable, message: usernameMessage } = useUsernameCheck(username);
  const { connected, address, signMessage, connect } = useSolanaWallet();

  // Extract referral code from URL on mount
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralCode(refCode.trim());
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signInMutation.mutateAsync({ email, password });
      if (result && result.token) {
        setSignedIn();
        // Trigger auth change event to update context
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:signin"));
        }
        navigate("/");
      }
    } catch (error) {
      // Error is already handled by the hook (toast notification)
    }
  };

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@") && isEmailAvailable === true) {
      setSignupStep("username");
    }
  };

  const handleUsernameNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 3 && isUsernameAvailable === true) {
      setSignupStep("password");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isUsernameAvailable !== true || isEmailAvailable !== true) {
      return;
    }
    try {
      const result = await signUpMutation.mutateAsync({
        email,
        password,
        username: username.trim(),
        referralCode: referralCode || undefined
      });
      if (result && result.token) {
        setSignedIn();
        // Trigger auth change event to update context
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:signin"));
        }
        navigate("/");
      }
    } catch (error) {
      // Error is already handled by the hook (toast notification)
    }
  };

  const handleBack = () => {
    if (signupStep === "password") {
      setSignupStep("username");
    } else if (signupStep === "username") {
      setSignupStep("email");
    }
  };

  const generateAuthMessage = (walletAddress: string, action: "signup" | "signin"): string => {
    const timestamp = Date.now();
    return `Welcome to OpenPredictionMarket!\n\n${action === "signup" ? "Sign up" : "Sign in"} with your Solana wallet.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
  };

  const handleWalletSignIn = async () => {
    if (!connected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsWalletSigning(true);
    try {
      const message = generateAuthMessage(address, "signin");
      const signatureBytes = await signMessage(message);

      if (!signatureBytes) {
        throw new Error("Failed to sign message");
      }

      // Convert signature to base58 string
      const signature = bs58.encode(signatureBytes);

      const result = await authApi.walletSignIn({
        walletAddress: address,
        signature,
        message,
      });

      if (result && result.token) {
        setSignedIn();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:signin"));
        }
        navigate("/");
        toast.success("Signed in with wallet!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with wallet");
    } finally {
      setIsWalletSigning(false);
    }
  };

  const handleWalletSignUp = async () => {
    if (!connected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!username.trim() || username.trim().length < 3 || isUsernameAvailable !== true) {
      toast.error("Please choose a valid username");
      return;
    }

    setIsWalletSigning(true);
    try {
      const message = generateAuthMessage(address, "signup");
      const signatureBytes = await signMessage(message);

      if (!signatureBytes) {
        throw new Error("Failed to sign message");
      }

      // Convert signature to base58 string
      const signature = bs58.encode(signatureBytes);

      const result = await authApi.walletSignUp({
        walletAddress: address,
        signature,
        message,
        username: username.trim(),
        referralCode: referralCode || undefined,
      });

      if (result && result.token) {
        setSignedIn();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:signin"));
        }
        navigate("/");
        toast.success("Account created with wallet!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up with wallet");
    } finally {
      setIsWalletSigning(false);
    }
  };

  // Auto-detect if wallet is connected - show signin screen by default
  useEffect(() => {
    if (connected && address && walletSignupStep === "connect") {
      // Default to signin view, user can switch to signup
      // Keep walletSignupStep as "connect" but we'll handle view differently
    }
  }, [connected, address]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to OpenPredictionMarket</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="signin"
              className="w-full"
              onValueChange={(value) => {
                if (value === "signup") {
                  setSignupStep("email");
                  setEmail("");
                  setUsername("");
                  setPassword("");
                  setWalletSignupStep("connect");
                } else if (value === "wallet") {
                  setWalletSignupStep("connect");
                  setUsername("");
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signInMutation.isPending}
                  >
                    {signInMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <div className="space-y-4 mt-4">
                  {/* Step indicator */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className={`flex items-center gap-2 ${signupStep === "email" ? "text-primary" : "text-muted-foreground"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${signupStep === "email" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        1
                      </div>
                      <span className="text-xs font-medium">Email</span>
                    </div>
                    <div className={`h-0.5 w-8 ${signupStep !== "email" ? "bg-primary" : "bg-muted"}`} />
                    <div className={`flex items-center gap-2 ${signupStep === "username" ? "text-primary" : signupStep === "password" ? "text-primary" : "text-muted-foreground"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${signupStep === "username" || signupStep === "password" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        2
                      </div>
                      <span className="text-xs font-medium">Username</span>
                    </div>
                    <div className={`h-0.5 w-8 ${signupStep === "password" ? "bg-primary" : "bg-muted"}`} />
                    <div className={`flex items-center gap-2 ${signupStep === "password" ? "text-primary" : "text-muted-foreground"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${signupStep === "password" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        3
                      </div>
                      <span className="text-xs font-medium">Password</span>
                    </div>
                  </div>

                  {/* Step 1: Email */}
                  {signupStep === "email" && (
                    <form onSubmit={handleEmailNext} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            className={`pr-10 ${isEmailAvailable === true ? "border-green-500" : isEmailAvailable === false ? "border-red-500" : ""}`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isCheckingEmail && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            {!isCheckingEmail && isEmailAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                            {!isCheckingEmail && isEmailAvailable === false && <X className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>
                        {emailMessage && (
                          <p className={`text-xs mt-1 ${isEmailAvailable === true ? "text-green-600" : "text-red-600"}`}>
                            {emailMessage}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!email || !email.includes("@") || isEmailAvailable !== true || isCheckingEmail}
                      >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  )}

                  {/* Step 2: Username */}
                  {signupStep === "username" && (
                    <form onSubmit={handleUsernameNext} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Choose a Username</label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            maxLength={30}
                            autoFocus
                            className={`pr-10 ${isUsernameAvailable === true ? "border-green-500" : isUsernameAvailable === false ? "border-red-500" : ""}`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            {!isCheckingUsername && isUsernameAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                            {!isCheckingUsername && isUsernameAvailable === false && <X className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>
                        {usernameMessage && (
                          <p className={`text-xs mt-1 ${isUsernameAvailable === true ? "text-green-600" : "text-red-600"}`}>
                            {usernameMessage}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          3-30 characters. This will be your profile URL: /user/{username || "username"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={handleBack}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={!username || username.trim().length < 3 || isUsernameAvailable !== true || isCheckingUsername}
                        >
                          Continue <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Step 3: Password */}
                  {signupStep === "password" && (
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Create Password</label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                          autoFocus
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Minimum 8 characters
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={handleBack}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={signUpMutation.isPending || password.length < 8}
                        >
                          {signUpMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing up...
                            </>
                          ) : (
                            "Sign Up"
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </TabsContent>

              {/* Wallet Tab */}
              <TabsContent value="wallet">
                <div className="space-y-4 mt-4">
                  {!connected && walletSignupStep === "connect" ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Wallet className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-lg font-semibold mb-2">Connect Your Solana Wallet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Connect your wallet to sign in or create an account
                        </p>
                        <WalletMultiButton className="w-full !bg-primary hover:!bg-primary/90 !text-primary-foreground !justify-center" />
                      </div>
                    </div>
                  ) : connected && address ? (
                    // Show signin by default, or signup if user clicks "Create account"
                    walletSignupStep === "username" ? (
                      // Wallet Signup (new user)
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleWalletSignUp();
                        }}
                        className="space-y-4"
                      >
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setWalletSignupStep("connect")}
                          className="w-full mb-2"
                          disabled={isWalletSigning}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Choose a Username</label>
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              required
                              minLength={3}
                              maxLength={30}
                              autoFocus
                              className={`pr-10 ${isUsernameAvailable === true ? "border-green-500" : isUsernameAvailable === false ? "border-red-500" : ""}`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                              {!isCheckingUsername && isUsernameAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                              {!isCheckingUsername && isUsernameAvailable === false && <X className="h-4 w-4 text-red-500" />}
                            </div>
                          </div>
                          {usernameMessage && (
                            <p className={`text-xs mt-1 ${isUsernameAvailable === true ? "text-green-600" : "text-red-600"}`}>
                              {usernameMessage}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            3-30 characters. This will be your profile URL: /user/{username || "username"}
                          </p>
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={!username || username.trim().length < 3 || isUsernameAvailable !== true || isCheckingUsername || isWalletSigning}
                        >
                          {isWalletSigning ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                            </>
                          ) : (
                            <>
                              Create Account <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          You'll be asked to sign a message to verify wallet ownership
                        </p>
                      </form>
                    ) : (
                      // Wallet Signin (existing user) - default view
                      <div className="space-y-4">
                        <div className="text-center">
                          <Wallet className="h-12 w-12 mx-auto mb-4 text-primary" />
                          <h3 className="text-lg font-semibold mb-2">Wallet Connected</h3>
                          <p className="text-sm text-muted-foreground mb-4 break-all">
                            {address}
                          </p>
                        </div>
                        <Button
                          onClick={handleWalletSignIn}
                          className="w-full"
                          disabled={isWalletSigning}
                        >
                          {isWalletSigning ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                            </>
                          ) : (
                            "Sign In with Wallet"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setWalletSignupStep("username")}
                          className="w-full"
                          disabled={isWalletSigning}
                        >
                          New user? Create account
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          You'll be asked to sign a message to verify wallet ownership
                        </p>
                      </div>
                    )
                  ) : null}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
