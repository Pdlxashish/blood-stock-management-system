'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Info, 
  Heart, 
  Users, 
  Target, 
  Award, 
  Edit, 
  Save,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import axiosInstance from '@/lib/axiosInstance';

interface AboutContent {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  missionTitle: string;
  missionContent: string;
  visionTitle: string;
  visionContent: string;
  values: string;
  storyTitle: string;
  storyContent: string;
  stats: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactEmergency: string;
  whatWeDo: string;
  createdAt: string;
  updatedAt: string;
}

interface ValueItem {
  title: string;
  description: string;
  icon: string;
}

interface StatItem {
  label: string;
  value: string;
}

interface WhatWeDoItem {
  title: string;
  description: string;
}

export default function AboutManagementPage() {
  const { token, user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSection, setEditSection] = useState<string>('');
  const [editData, setEditData] = useState<any>({});

  // Check admin status after hydration
  useEffect(() => {
    if (!_hasHydrated) return;
    
    const adminStatus = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'STAFF');
    setIsAdmin(adminStatus);
  }, [_hasHydrated, isAuthenticated, user]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axiosInstance.get('/api/about');
      setContent(response.data.data);
    } catch (error) {
      console.error('Error fetching about content:', error);
      toast.error('Failed to load about content');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (section: string) => {
    if (!content) return;

    setEditSection(section);

    switch (section) {
      case 'hero':
        setEditData({
          heroTitle: content.heroTitle,
          heroSubtitle: content.heroSubtitle,
        });
        break;
      case 'mission':
        setEditData({
          missionTitle: content.missionTitle,
          missionContent: content.missionContent,
        });
        break;
      case 'vision':
        setEditData({
          visionTitle: content.visionTitle,
          visionContent: content.visionContent,
        });
        break;
      case 'values':
        setEditData({
          values: JSON.parse(content.values),
        });
        break;
      case 'story':
        setEditData({
          storyTitle: content.storyTitle,
          storyContent: content.storyContent,
        });
        break;
      case 'stats':
        setEditData({
          stats: JSON.parse(content.stats),
        });
        break;
      case 'contact':
        setEditData({
          contactAddress: content.contactAddress,
          contactPhone: content.contactPhone,
          contactEmail: content.contactEmail,
          contactEmergency: content.contactEmergency,
        });
        break;
      case 'whatWeDo':
        setEditData({
          whatWeDo: JSON.parse(content.whatWeDo),
        });
        break;
    }

    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token || !isAdmin) {
      toast.error('Please login as admin to edit content');
      return;
    }

    setSaving(true);

    try {
      const updatePayload: any = {};

      switch (editSection) {
        case 'hero':
          updatePayload.heroTitle = editData.heroTitle;
          updatePayload.heroSubtitle = editData.heroSubtitle;
          break;
        case 'mission':
          updatePayload.missionTitle = editData.missionTitle;
          updatePayload.missionContent = editData.missionContent;
          break;
        case 'vision':
          updatePayload.visionTitle = editData.visionTitle;
          updatePayload.visionContent = editData.visionContent;
          break;
        case 'values':
          updatePayload.values = JSON.stringify(editData.values);
          break;
        case 'story':
          updatePayload.storyTitle = editData.storyTitle;
          updatePayload.storyContent = editData.storyContent;
          break;
        case 'stats':
          updatePayload.stats = JSON.stringify(editData.stats);
          break;
        case 'contact':
          updatePayload.contactAddress = editData.contactAddress;
          updatePayload.contactPhone = editData.contactPhone;
          updatePayload.contactEmail = editData.contactEmail;
          updatePayload.contactEmergency = editData.contactEmergency;
          break;
        case 'whatWeDo':
          updatePayload.whatWeDo = JSON.stringify(editData.whatWeDo);
          break;
      }

      await axiosInstance.put('/api/about', updatePayload);

      toast.success('Content updated successfully');
      setEditDialogOpen(false);
      fetchContent();
    } catch (error: any) {
      console.error('Error updating content:', error);
      toast.error(error.response?.data?.message || 'Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (field: string) => {
    const newItem = field === 'values' 
      ? { title: '', description: '', icon: 'Heart' }
      : field === 'stats'
      ? { label: '', value: '' }
      : { title: '', description: '' };

    setEditData({
      ...editData,
      [field]: [...editData[field], newItem],
    });
  };

  const removeArrayItem = (field: string, index: number) => {
    setEditData({
      ...editData,
      [field]: editData[field].filter((_: any, i: number) => i !== index),
    });
  };

  const updateArrayItem = (field: string, index: number, key: string, value: string) => {
    const updated = [...editData[field]];
    updated[index][key] = value;
    setEditData({
      ...editData,
      [field]: updated,
    });
  };

  if (loading || !_hasHydrated) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load content</p>
      </div>
    );
  }

  const values: ValueItem[] = JSON.parse(content.values);
  const stats: StatItem[] = JSON.parse(content.stats);
  const whatWeDo: WhatWeDoItem[] = JSON.parse(content.whatWeDo);

  const iconMap: any = {
    Heart,
    Users,
    Target,
    Award,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-500 text-white">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Page Management</h1>
          <p className="text-muted-foreground">
            Edit content for the public about page
            {!isAdmin && ' (View-only mode - Login as admin to edit)'}
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Hero Section</CardTitle>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => openEditDialog('hero')}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold mb-2">{content.heroTitle}</h2>
          <p className="text-muted-foreground">{content.heroSubtitle}</p>
        </CardContent>
      </Card>

      {/* Mission & Vision */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              {content.missionTitle}
            </CardTitle>
            {isAdmin && (
              <Button size="sm" variant="outline" onClick={() => openEditDialog('mission')}>
                <Edit className="w-3 h-3" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{content.missionContent}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              {content.visionTitle}
            </CardTitle>
            {isAdmin && (
              <Button size="sm" variant="outline" onClick={() => openEditDialog('vision')}>
                <Edit className="w-3 h-3" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{content.visionContent}</p>
          </CardContent>
        </Card>
      </div>

      {/* Values */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Our Values</CardTitle>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => openEditDialog('values')}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {values.map((value, index) => {
              const IconComponent = iconMap[value.icon] || Heart;
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600 mb-3">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Story */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{content.storyTitle}</CardTitle>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => openEditDialog('story')}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{content.storyContent}</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Our Impact</CardTitle>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => openEditDialog('stats')}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-red-600">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What We Do */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>What We Do</CardTitle>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => openEditDialog('whatWeDo')}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {whatWeDo.map((item, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contact Information</CardTitle>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => openEditDialog('contact')}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm"><strong>Address:</strong> {content.contactAddress}</p>
          <p className="text-sm"><strong>Phone:</strong> {content.contactPhone}</p>
          <p className="text-sm"><strong>Email:</strong> {content.contactEmail}</p>
          <p className="text-sm"><strong>Emergency Hotline:</strong> {content.contactEmergency}</p>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="edit-dialog-description">
          <DialogHeader>
            <DialogTitle>Edit {editSection}</DialogTitle>
          </DialogHeader>
          <p id="edit-dialog-description" className="sr-only">
            Edit the {editSection} section content
          </p>
          <div className="space-y-4">
            {/* Hero Section */}
            {editSection === 'hero' && (
              <>
                <div>
                  <Label htmlFor="heroTitle">Title</Label>
                  <Input
                    id="heroTitle"
                    value={editData.heroTitle || ''}
                    onChange={(e) => setEditData({ ...editData, heroTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="heroSubtitle">Subtitle</Label>
                  <Textarea
                    id="heroSubtitle"
                    value={editData.heroSubtitle || ''}
                    onChange={(e) => setEditData({ ...editData, heroSubtitle: e.target.value })}
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Mission Section */}
            {editSection === 'mission' && (
              <>
                <div>
                  <Label htmlFor="missionTitle">Title</Label>
                  <Input
                    id="missionTitle"
                    value={editData.missionTitle || ''}
                    onChange={(e) => setEditData({ ...editData, missionTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="missionContent">Content</Label>
                  <Textarea
                    id="missionContent"
                    value={editData.missionContent || ''}
                    onChange={(e) => setEditData({ ...editData, missionContent: e.target.value })}
                    rows={4}
                  />
                </div>
              </>
            )}

            {/* Vision Section */}
            {editSection === 'vision' && (
              <>
                <div>
                  <Label htmlFor="visionTitle">Title</Label>
                  <Input
                    id="visionTitle"
                    value={editData.visionTitle || ''}
                    onChange={(e) => setEditData({ ...editData, visionTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="visionContent">Content</Label>
                  <Textarea
                    id="visionContent"
                    value={editData.visionContent || ''}
                    onChange={(e) => setEditData({ ...editData, visionContent: e.target.value })}
                    rows={4}
                  />
                </div>
              </>
            )}

            {/* Values Section */}
            {editSection === 'values' && (
              <div className="space-y-4">
                {editData.values?.map((value: ValueItem, index: number) => (
                  <Card key={index}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Value {index + 1}</Label>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeArrayItem('values', index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Title"
                        value={value.title}
                        onChange={(e) => updateArrayItem('values', index, 'title', e.target.value)}
                      />
                      <Textarea
                        placeholder="Description"
                        value={value.description}
                        onChange={(e) => updateArrayItem('values', index, 'description', e.target.value)}
                        rows={2}
                      />
                      <select
                        className="w-full border rounded-md p-2"
                        value={value.icon}
                        onChange={(e) => updateArrayItem('values', index, 'icon', e.target.value)}
                      >
                        <option value="Heart">Heart</option>
                        <option value="Users">Users</option>
                        <option value="Target">Target</option>
                        <option value="Award">Award</option>
                      </select>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={() => addArrayItem('values')} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Value
                </Button>
              </div>
            )}

            {/* Story Section */}
            {editSection === 'story' && (
              <>
                <div>
                  <Label htmlFor="storyTitle">Title</Label>
                  <Input
                    id="storyTitle"
                    value={editData.storyTitle || ''}
                    onChange={(e) => setEditData({ ...editData, storyTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="storyContent">Content</Label>
                  <Textarea
                    id="storyContent"
                    value={editData.storyContent || ''}
                    onChange={(e) => setEditData({ ...editData, storyContent: e.target.value })}
                    rows={6}
                  />
                </div>
              </>
            )}

            {/* Stats Section */}
            {editSection === 'stats' && (
              <div className="space-y-4">
                {editData.stats?.map((stat: StatItem, index: number) => (
                  <Card key={index}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Stat {index + 1}</Label>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeArrayItem('stats', index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Label"
                        value={stat.label}
                        onChange={(e) => updateArrayItem('stats', index, 'label', e.target.value)}
                      />
                      <Input
                        placeholder="Value (e.g., 500+)"
                        value={stat.value}
                        onChange={(e) => updateArrayItem('stats', index, 'value', e.target.value)}
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={() => addArrayItem('stats')} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stat
                </Button>
              </div>
            )}

            {/* Contact Section */}
            {editSection === 'contact' && (
              <>
                <div>
                  <Label htmlFor="contactAddress">Address</Label>
                  <Input
                    id="contactAddress"
                    value={editData.contactAddress || ''}
                    onChange={(e) => setEditData({ ...editData, contactAddress: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    value={editData.contactPhone || ''}
                    onChange={(e) => setEditData({ ...editData, contactPhone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={editData.contactEmail || ''}
                    onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmergency">Emergency Hotline</Label>
                  <Input
                    id="contactEmergency"
                    value={editData.contactEmergency || ''}
                    onChange={(e) => setEditData({ ...editData, contactEmergency: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* What We Do Section */}
            {editSection === 'whatWeDo' && (
              <div className="space-y-4">
                {editData.whatWeDo?.map((item: WhatWeDoItem, index: number) => (
                  <Card key={index}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Item {index + 1}</Label>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeArrayItem('whatWeDo', index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) => updateArrayItem('whatWeDo', index, 'title', e.target.value)}
                      />
                      <Textarea
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateArrayItem('whatWeDo', index, 'description', e.target.value)}
                        rows={2}
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={() => addArrayItem('whatWeDo')} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
