"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Star, MapPin, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Destination } from "@/lib/types";
import Image from "next/image";

export default function DestinationsManagementPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: 0,
    duration: "",
    shortDescription: "",
    description: "",
    highlights: [""],
    images: [""],
    itinerary: [{ day: 1, title: "", description: "" }],
    inclusions: [""],
    exclusions: [""],
    featured: false,
    showOnHomepage: true,
    rating: 4.5,
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await fetch("/api/destinations");
      const data = await response.json();
      if (data.success) {
        setDestinations(data.data);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
      toast.error("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (destination?: Destination) => {
    if (destination) {
      setEditingDestination(destination);
      setFormData({
        name: destination.name,
        slug: destination.slug,
        price: destination.price,
        duration: destination.duration,
        shortDescription: destination.shortDescription,
        description: destination.description,
        highlights: destination.highlights,
        images: destination.images,
        itinerary: destination.itinerary,
        inclusions: destination.inclusions,
        exclusions: destination.exclusions,
        featured: destination.featured,
        showOnHomepage: destination.showOnHomepage ?? true,
        rating: destination.rating,
      });
    } else {
      setEditingDestination(null);
      setFormData({
        name: "",
        slug: "",
        price: 0,
        duration: "",
        shortDescription: "",
        description: "",
        highlights: [""],
        images: [""],
        itinerary: [{ day: 1, title: "", description: "" }],
        inclusions: [""],
        exclusions: [""],
        featured: false,
        showOnHomepage: true,
        rating: 4.5,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Filter out empty values
      const cleanedData = {
        ...formData,
        highlights: formData.highlights.filter(h => h.trim()),
        images: formData.images.filter(i => i.trim()),
        inclusions: formData.inclusions.filter(i => i.trim()),
        exclusions: formData.exclusions.filter(e => e.trim()),
        itinerary: formData.itinerary.filter(i => i.title && i.description),
      };

      const url = editingDestination
        ? `/api/destinations/${editingDestination.id}`
        : "/api/destinations";

      const response = await fetch(url, {
        method: editingDestination ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          editingDestination
            ? "Destination updated successfully"
            : "Destination created successfully"
        );
        setDialogOpen(false);
        fetchDestinations();
      } else {
        toast.error(result.error || "Failed to save destination");
      }
    } catch (error) {
      console.error("Error saving destination:", error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/destinations/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Destination deleted successfully");
        fetchDestinations();
      } else {
        toast.error("Failed to delete destination");
      }
    } catch (error) {
      console.error("Error deleting destination:", error);
      toast.error("An error occurred");
    }
  };

  const addArrayItem = (field: keyof typeof formData) => {
    setFormData({
      ...formData,
      [field]: [...(formData[field] as any[]), field === "itinerary" ? { day: formData.itinerary.length + 1, title: "", description: "" } : ""],
    });
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData({
      ...formData,
      [field]: (formData[field] as any[]).filter((_, i) => i !== index),
    });
  };

  const updateArrayItem = (field: keyof typeof formData, index: number, value: any) => {
    const updated = [...(formData[field] as any[])];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destinations</h1>
          <p className="text-gray-600 mt-2">Manage your tour packages and destinations</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Destination
        </Button>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : destinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={destination.images[0]}
                    alt={destination.name}
                    fill
                    className="object-cover"
                  />
                  {destination.featured && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  )}
                  {destination.showOnHomepage && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Homepage
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{destination.rating}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-2 line-clamp-1">
                    {destination.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {destination.shortDescription}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{destination.duration}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-lg font-bold text-purple-600">
                      ₹{destination.price.toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(destination)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(destination.id, destination.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No destinations yet
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first destination
          </p>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Destination
          </Button>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDestination ? "Edit Destination" : "Add New Destination"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (!editingDestination) {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      });
                    }
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration *</label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="5 Days / 4 Nights"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rating *</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Short Description *</label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Full Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium mb-2">Image URLs</label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={image}
                    onChange={(e) => updateArrayItem("images", index, e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {formData.images.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem("images", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("images")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </div>

            {/* Highlights */}
            <div>
              <label className="block text-sm font-medium mb-2">Highlights</label>
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={highlight}
                    onChange={(e) => updateArrayItem("highlights", index, e.target.value)}
                    placeholder="Highlight..."
                  />
                  {formData.highlights.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem("highlights", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("highlights")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Highlight
              </Button>
            </div>

            {/* Inclusions */}
            <div>
              <label className="block text-sm font-medium mb-2">Inclusions</label>
              {formData.inclusions.map((inclusion, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={inclusion}
                    onChange={(e) => updateArrayItem("inclusions", index, e.target.value)}
                    placeholder="Inclusion..."
                  />
                  {formData.inclusions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem("inclusions", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("inclusions")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Inclusion
              </Button>
            </div>

            {/* Exclusions */}
            <div>
              <label className="block text-sm font-medium mb-2">Exclusions</label>
              {formData.exclusions.map((exclusion, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={exclusion}
                    onChange={(e) => updateArrayItem("exclusions", index, e.target.value)}
                    placeholder="Exclusion..."
                  />
                  {formData.exclusions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem("exclusions", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("exclusions")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Exclusion
              </Button>
            </div>

            {/* Itinerary */}
            <div>
              <label className="block text-sm font-medium mb-2">Itinerary</label>
              {formData.itinerary.map((day, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Day {day.day}</span>
                    {formData.itinerary.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem("itinerary", index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={day.title}
                    onChange={(e) =>
                      updateArrayItem("itinerary", index, { ...day, title: e.target.value })
                    }
                    placeholder="Day title..."
                    className="mb-2"
                  />
                  <Textarea
                    value={day.description}
                    onChange={(e) =>
                      updateArrayItem("itinerary", index, { ...day, description: e.target.value })
                    }
                    placeholder="Day description..."
                    rows={2}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("itinerary")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Day
              </Button>
            </div>

            {/* Visibility Options */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-gray-900">Visibility Settings</h3>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showOnHomepage"
                  checked={formData.showOnHomepage}
                  onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="showOnHomepage" className="text-sm font-medium">
                  Show on Homepage
                </label>
                <span className="text-xs text-gray-500 ml-2">
                  (Controls if this destination appears on the home page)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured Destination
                </label>
                <span className="text-xs text-gray-500 ml-2">
                  (Shows "Featured" badge on destination card)
                </span>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingDestination ? (
                  "Update Destination"
                ) : (
                  "Create Destination"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}