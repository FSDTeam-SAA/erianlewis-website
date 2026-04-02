"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

interface ReviewSectionProps {
    propertyId: string;
}

interface ReviewItem {
    _id: string;
    user?: {
        _id?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        profileImage?: string;
    };
    rating: number;
    comment?: string;
    createdAt?: string;
}

interface ReviewResponse {
    reviews: ReviewItem[];
    avgRating: number;
    totalReviews: number;
}

const renderStars = (rating: number, size = 15) =>
    [1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
    ));

export function ReviewSection({ propertyId }: ReviewSectionProps) {
    const { data: session } = useSession();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const reviewsQuery = useQuery({
        queryKey: ["property-reviews", propertyId],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reviews/property/${propertyId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            });

            const payload = await response.json();
            if (!response.ok || !payload?.status) {
                throw new Error(payload?.message || "Failed to load reviews");
            }

            return payload.data as ReviewResponse;
        },
    });

    const averageLabel = useMemo(() => {
        return Number(reviewsQuery.data?.avgRating || 0).toFixed(1);
    }, [reviewsQuery.data?.avgRating]);

    const handleSubmit = async () => {
        if (!session?.user?.accessToken) {
            toast.error("Please sign in to leave a review");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify({
                    propertyId,
                    rating,
                    comment,
                }),
            });

            const payload = await response.json();
            if (!response.ok || !payload?.status) {
                throw new Error(payload?.message || "Failed to submit review");
            }

            toast.success("Review submitted successfully");
            setComment("");
            reviewsQuery.refetch();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-8" id="reviews">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-gray-900">Reviews</h2>
                <button
                    type="button"
                    onClick={() => document.getElementById("review-comments")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-[12px] font-bold text-orange-500 hover:text-orange-600 hover:underline transition-all"
                >
                    Jump to comments
                </button>
            </div>

            {reviewsQuery.isLoading ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-[#8BCCE6]" />
                </div>
            ) : reviewsQuery.isError ? (
                <div className="rounded-2xl border border-[#f3c7ba] bg-[#fff7f2] p-5 text-sm text-[#6b7280]">
                    Failed to load reviews.
                </div>
            ) : (
                <>
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex gap-0.5">{renderStars(reviewsQuery.data?.avgRating || 0)}</div>
                        <span className="text-[13px] font-bold text-gray-700">
                            {averageLabel} <span className="font-medium text-gray-500">({reviewsQuery.data?.totalReviews || 0})</span>
                        </span>
                    </div>

                    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="mb-3 text-[13px] font-bold text-gray-700">Leave a review</p>
                        {!session?.user?.accessToken ? (
                            <p className="text-[12px] font-medium text-gray-400">Sign in to leave a review</p>
                        ) : (
                            <>
                                <div className="mb-3 flex gap-1">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button key={value} type="button" onClick={() => setRating(value)}>
                                            <Star className={value <= rating ? "h-5 w-5 fill-yellow-400 text-yellow-400" : "h-5 w-5 text-gray-200"} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    rows={3}
                                    placeholder="Share your experience..."
                                    className="mb-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] font-medium text-gray-800 outline-none transition-all placeholder:font-normal focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                />
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center rounded-xl bg-[#202124] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
                                </button>
                            </>
                        )}
                    </div>

                    <h3 className="mb-3 text-[13px] font-bold text-gray-700" id="review-comments">Comments</h3>
                    <div className="space-y-3">
                        {(reviewsQuery.data?.reviews || []).length ? (
                            reviewsQuery.data?.reviews.map((review) => (
                                <div key={review._id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-[14px] font-bold text-gray-900">
                                            {[review.user?.firstName, review.user?.lastName].filter(Boolean).join(" ") || review.user?.email || "Anonymous"}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex gap-0.5">{renderStars(review.rating, 12)}</div>
                                            <span className="text-xs font-semibold text-gray-500">{Number(review.rating).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <p className="text-[13px] font-medium text-gray-500">{review.comment || "No comment."}</p>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 text-[13px] font-medium text-gray-400 shadow-sm">
                                No reviews yet.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
