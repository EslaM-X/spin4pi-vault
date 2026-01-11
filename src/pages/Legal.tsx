import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Legal = () => {
  const [termsOpen, setTermsOpen] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-400">
            Legal Information
          </h1>
        </div>

        <div className="space-y-6">
          {/* Terms of Use */}
          <Card className="bg-black/70 border border-white/20 backdrop-blur-sm">
            <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-white/10 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-yellow-400" />
                      <span>Terms of Use</span>
                    </div>
                    {termsOpen ? (
                      <ChevronUp className="h-5 w-5 text-gray-300" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-300" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none text-gray-200">
                  <p className="text-sm mb-4">Last Updated: January 10, 2026</p>

                  <h3 className="text-lg font-semibold text-white">1. Entertainment Purpose</h3>
                  <p>
                    Spin4Pi is an entertainment-based application. All spin outcomes are probabilistic and randomized.
                    The App does not guarantee any specific outcomes or rewards.
                  </p>

                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 my-4">
                    <h4 className="text-red-500 font-semibold flex items-center gap-2">
                      ⚠️ No Guarantee of Profit
                    </h4>
                    <p className="text-red-400 text-sm mt-2">
                      There is absolutely no guarantee of profit from using Spin4Pi. Past performance does not
                      indicate future results. You may lose the Pi tokens you spend on spins.
                    </p>
                  </div>

                  <h3 className="text-lg font-semibold text-white">2. Not Gambling</h3>
                  <p>
                    Spin4Pi is NOT a gambling platform. Pi tokens used within the App are utility tokens for
                    entertainment purposes only. Users should not expect monetary returns.
                  </p>

                  <h3 className="text-lg font-semibold text-white">3. House Edge</h3>
                  <p>
                    The App maintains a house edge of 35-45% on all spins to ensure platform sustainability.
                  </p>

                  <h3 className="text-lg font-semibold text-white">4. Prohibited Activities</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Using bots, scripts, or automated tools</li>
                    <li>Exploiting bugs or vulnerabilities</li>
                    <li>Creating multiple accounts</li>
                    <li>Attempting to manipulate spin outcomes</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-white">5. Payments</h3>
                  <p>
                    All payments are processed through the official Pi Network payment system.
                    All payments are final and non-refundable.
                  </p>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Privacy Policy */}
          <Card className="bg-black/70 border border-white/20 backdrop-blur-sm">
            <Collapsible open={privacyOpen} onOpenChange={setPrivacyOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-white/10 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-green-400" />
                      <span>Privacy Policy</span>
                    </div>
                    {privacyOpen ? (
                      <ChevronUp className="h-5 w-5 text-gray-300" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-300" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none text-gray-200">
                  <p className="text-sm mb-4">Last Updated: January 10, 2026</p>

                  <h3 className="text-lg font-semibold text-white">Data We Collect</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <h4 className="font-medium text-white text-sm">From Pi Network</h4>
                      <ul className="text-gray-300 text-xs mt-2 space-y-1">
                        <li>• Pi Username</li>
                        <li>• User ID (UID)</li>
                        <li>• Session Token</li>
                      </ul>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <h4 className="font-medium text-white text-sm">We Generate</h4>
                      <ul className="text-gray-300 text-xs mt-2 space-y-1">
                        <li>• Spin History</li>
                        <li>• Statistics</li>
                        <li>• NFT Ownership</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 my-4">
                    <h4 className="text-green-400 font-semibold">🔒 We Do NOT Have Access To:</h4>
                    <ul className="text-green-400/80 text-sm mt-2 space-y-1">
                      <li>• Your Pi wallet private keys</li>
                      <li>• Your Pi wallet balance</li>
                      <li>• Your personal identification documents</li>
                    </ul>
                  </div>

                  <h3 className="text-lg font-semibold text-white">Data Sharing</h3>
                  <p>
                    We never sell, rent, or trade your personal information. Data is only shared with
                    Pi Network for payments and optional email providers for notifications.
                  </p>

                  <h3 className="text-lg font-semibold text-white">Your Rights</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Access your personal data</li>
                    <li>Request data correction or deletion</li>
                    <li>Opt out of notifications</li>
                    <li>Export your data</li>
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Pi Network Compliance Badge */}
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-2xl">π</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Pi Network Compliant</h3>
                  <p className="text-sm text-gray-300">
                    Spin4Pi operates within the Pi Network ecosystem and complies with all Pi Network policies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Legal;
