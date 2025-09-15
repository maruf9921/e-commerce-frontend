'use client';
import React, { useState } from 'react';
import { adminAPI } from '@/lib/adminAPI';
import { useToast } from '@/contexts/ToastContext';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'templates'>('compose');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Email composition state
  const [emailData, setEmailData] = useState({
    recipients: [] as string[],
    recipientType: 'custom' as 'custom' | 'all_users' | 'all_sellers',
    subject: '',
    message: '',
    isHtml: false
  });

  // Template state
  const [templates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Our E-commerce Platform!',
      content: 'Dear {{username}},\n\nWelcome to our platform! We are excited to have you on board.\n\nBest regards,\nThe Team'
    },
    {
      id: '2',
      name: 'Order Confirmation',
      subject: 'Order Confirmation - Order #{{orderNumber}}',
      content: 'Dear {{username}},\n\nYour order #{{orderNumber}} has been confirmed and is being processed.\n\nTotal Amount: ${{totalAmount}}\n\nThank you for your purchase!\n\nBest regards,\nThe Team'
    },
    {
      id: '3',
      name: 'Seller Verification',
      subject: 'Seller Account Verified',
      content: 'Dear {{username}},\n\nCongratulations! Your seller account has been verified and approved.\n\nYou can now start listing your products on our platform.\n\nBest regards,\nThe Team'
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const recipients = e.target.value.split(',').map(email => email.trim()).filter(email => email);
    setEmailData({ ...emailData, recipients });
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setEmailData({
      ...emailData,
      subject: template.subject,
      message: template.content
    });
    setSelectedTemplate(template);
    setActiveTab('compose');
  };

  const sendEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      addToast('Please fill in subject and message', 'error');
      return;
    }

    let recipients = emailData.recipients;
    
    if (emailData.recipientType === 'all_users') {
      recipients = ['all_users'];
    } else if (emailData.recipientType === 'all_sellers') {
      recipients = ['all_sellers'];
    } else if (recipients.length === 0) {
      addToast('Please specify recipients', 'error');
      return;
    }

    setLoading(true);
    try {
      await adminAPI.sendEmail({
        subject: emailData.subject,
        message: emailData.message,
        recipients
      });
      
      addToast('Email sent successfully!', 'success');
      
      // Reset form
      setEmailData({
        recipients: [],
        recipientType: 'custom',
        subject: '',
        message: '',
        isHtml: false
      });
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to send email:', error);
      addToast('Failed to send email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendWelcomeEmail = async (email: string) => {
    if (!email.trim()) {
      addToast('Please enter an email address', 'error');
      return;
    }

    setLoading(true);
    try {
      await adminAPI.sendWelcomeEmail(email);
      addToast('Welcome email sent successfully!', 'success');
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      addToast('Failed to send welcome email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Email System</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('compose')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'compose'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Compose Email
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Email Templates
            </button>
          </nav>
        </div>

        {/* Compose Email Tab */}
        {activeTab === 'compose' && (
          <div className="p-6">
            <div className="space-y-6">
              {/* Recipient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        value="custom"
                        checked={emailData.recipientType === 'custom'}
                        onChange={(e) => setEmailData({ ...emailData, recipientType: e.target.value as any })}
                        className="mr-2"
                      />
                      Custom Recipients
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        value="all_users"
                        checked={emailData.recipientType === 'all_users'}
                        onChange={(e) => setEmailData({ ...emailData, recipientType: e.target.value as any })}
                        className="mr-2"
                      />
                      All Users
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        value="all_sellers"
                        checked={emailData.recipientType === 'all_sellers'}
                        onChange={(e) => setEmailData({ ...emailData, recipientType: e.target.value as any })}
                        className="mr-2"
                      />
                      All Sellers
                    </label>
                  </div>

                  {emailData.recipientType === 'custom' && (
                    <input
                      type="text"
                      placeholder="Enter email addresses separated by commas"
                      onChange={handleRecipientChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  placeholder="Email content"
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Selected Template Info */}
              {selectedTemplate && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Using template:</strong> {selectedTemplate.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    You can edit the subject and message above before sending.
                  </p>
                </div>
              )}

              {/* Send Button */}
              <div>
                <button
                  onClick={sendEmail}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Templates Tab */}
        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Email Templates</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Subject:</strong> {template.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {template.content.substring(0, 100)}...
                    </p>
                    <div className="mt-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Template Variables Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Available Template Variables</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><code className="bg-gray-200 px-1 rounded">{'{{username}}'}</code> - Recipient's username</p>
                  <p><code className="bg-gray-200 px-1 rounded">{'{{email}}'}</code> - Recipient's email</p>
                  <p><code className="bg-gray-200 px-1 rounded">{'{{orderNumber}}'}</code> - Order number (for order emails)</p>
                  <p><code className="bg-gray-200 px-1 rounded">{'{{totalAmount}}'}</code> - Order total (for order emails)</p>
                  <p className="text-xs text-gray-500 mt-2">
                    These variables will be automatically replaced when sending emails.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Email Actions</h3>
        
        <div className="space-y-4">
          {/* Send Welcome Email */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send Welcome Email
              </label>
              <input
                id="welcomeEmail"
                type="email"
                placeholder="Enter user email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => {
                const email = (document.getElementById('welcomeEmail') as HTMLInputElement)?.value;
                if (email) sendWelcomeEmail(email);
              }}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Send Welcome
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
