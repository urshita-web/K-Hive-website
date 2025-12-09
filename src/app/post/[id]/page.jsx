"use client";

import { useParams } from "next/navigation";
import { usePost, useVotePost } from "@/lib/hooks/usePosts";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, PlusCircle, MinusCircle, Reply } from "lucide-react";

const post = {
    postId: 1,
    userId: 1,
    title: "Sample Post Title",
    content: "This is a sample post body to illustrate the post page layout.",
    user: {
        name: "Jane Doe"
    },
    upvotes: 10,
    downvotes: 2,
    tags: ["example"],
    createdAt: "2024-08-14T10:23:45.000Z",
    subreddit: "r/example",
    media: ["https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.o5Jmne56A7_ac_gPnT8EMgAAAA%3Fpid%3DApi&f=1&ipt=7cfef708b447ff123deacf022b44eddcacdd08e57c906419a348baed092272e1&ipo=images"],
};

const comments = [
    {
        id: 1,
        parentId: null,
        user: {
            name: "John Doe"
        },
        text: "This is a sample comment.",
        votes: 0,
        createdAt: "2024-08-14T10:23:45.000Z",
        children: [],
    },
    {
        id: 2,
        parentId: 1,
        user: {
            name: "Jane Doe"
        },
        text: "This is a sample reply.",
        votes: 0,
        createdAt: "2024-08-14T10:23:45.000Z",
        children: [],
    },
    {
        id: 3,
        parentId: 1,
        user: {
            name: "John Doe"
        },
        text: "This is another sample comment.",
        votes: 0,
        createdAt: "2024-08-14T10:23:45.000Z",
        children: [],
    },
    {
        id: 4,
        parentId: 2,
        user: {
            name: "Jane Doe"
        },
        text: "This is a sample reply.",
        votes: 0,
        createdAt: "2024-08-14T10:23:45.000Z",
        children: [],
    },
    {
        id: 5,
        parentId: null,
        user: {
            name: "John Doe"
        },
        text: "This is another sample comment.",
        votes: 0,
        createdAt: "2024-08-14T10:23:45.000Z",
        children: [],
    }
];

function buildTree(flat = []) {
    const map = new Map();
    flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
    const roots = [];
    for (const c of map.values()) {
        if (c.parentId == null) roots.push(c);
        else {
            const parent = map.get(c.parentId);
            if (parent) parent.children.push(c);
            else roots.push(c);
        }
    }
    const sortRec = (arr) => {
        arr.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        arr.forEach((x) => sortRec(x.children));
    };
    sortRec(roots);
    return roots;
}

const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const formatVoteCount = (count) => {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
};

function Comment({
    comment,
    onToggleCollapse,
    depth = 0
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [showReply, setShowReply] = useState(false);
    const router = useRouter();

    return (
        <div className="flex mt-3" style={{ marginLeft: depth * 18 }}>

            <div className="flex flex-col items-center mr-3 select-none">
                <button className="text-gray-400 hover:text-[#ff4500] p-0.5 sm:p-1 rounded transition-all duration-300 hover:scale-110 active:scale-95"><ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" /></button>
                <div className="text-sm font-medium">{comment.votes}</div>
                <button className="text-gray-400 hover:text-[#7193ff] p-0.5 sm:p-1 rounded transition-all duration-300 hover:scale-110 active:scale-95"><ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" /></button>
            </div>

            <div className="flex-1">
                <div className="text-xs text-gray-500">
                    <span onClick={() => router.push(`/profile/${post.userId}`)} className="hover:underline cursor-pointer font-medium text-sm mr-2">{comment.user?.name}</span>
                    <span>{formatTimeAgo(comment.createdAt)}</span>
                </div>

                <div className={`mt-1 text-sm ${collapsed ? "line-clamp-1" : ""}`}>
                    {comment.text}
                </div>

                <div className="mt-2 text-xs text-gray-600 flex items-center gap-4">
                    <button
                        className="hover:underline cursor-pointer"
                        onClick={() => {
                            setCollapsed((c) => !c);
                            onToggleCollapse?.(comment.id, !collapsed);
                        }}
                    >
                        {collapsed ? <PlusCircle size={18} /> : <MinusCircle size={18} />}
                    </button>

                    <button
                        className="hover:underline cursor-pointer"
                        onClick={() => setShowReply((prev) => !prev)}
                    >
                        <Reply size={16} className="text-gray-500" />
                    </button>
                </div>

                {showReply && (
                    <div className="mt-2">
                        <InlineReply
                            parentId={comment.id}
                            onCancel={() => setShowReply(false)}
                        />
                    </div>
                )}


                {comment.children?.length > 0 && !collapsed && (
                    <div className="mt-2">
                        {comment.children.map((c) => (
                            <Comment
                                key={c.id}
                                comment={c}
                                onToggleCollapse={onToggleCollapse}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function InlineReply({ parentId = null, onCancel }) {
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleCancel = () => {
        setText("");
        onCancel?.();
    };

    return (
        <div className="flex flex-col gap-2 items-start">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full border rounded p-2 text-sm cursor-text"
                placeholder="Add a comment..."
            />

            <div className="flex gap-2 mt-2">
                <button
                    className="cursor-pointer px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
                    disabled={submitting}
                >
                    Reply
                </button>

                <button
                    className="cursor-pointer px-3 py-1 rounded border text-sm"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
            </div>
        </div>

    );
}

export default function PostPage() {
    /*
    const { id } = useParams();
    const { data } = useAuth();
    const user = data?.user || null;
    const { data: post } = usePost(id);
    */
    const router = useRouter();
    const { mutate: votePost } = useVotePost();

    const handleVote = (postId, voteType) => {
        votePost({ postId, voteType });
    };

    const [collapsedComments, setCollapsedComments] = useState(new Set());

    const handleToggleCollapse = (id) => {
        setCollapsedComments(prev => {
            const updated = new Set(prev);
            updated.has(id) ? updated.delete(id) : updated.add(id);
            return updated;
        });
    };

    const tree = buildTree(comments);

    const sortedTree = [...tree].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


    if (!post) return <div className="p-6">Post not found.</div>;

    return (
        <div className="max-w-3xl bg-[#020d17] mx-auto p-6">
            <div className="flex gap-4 bg-[#0d1d2c] border rounded-lg p-4 shadow-sm">
                <div className="flex flex-col items-center select-none">
                    <button
                        onClick={() => handleVote(post.postId, "upvote")}
                        className="text-gray-400 hover:text-[#ff4500] cursor-pointer p-0.5 sm:p-1 rounded transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                        <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </button>
                    <span className="text-white font-bold text-[10px] sm:text-xs md:text-sm leading-tight">
                        {formatVoteCount(post.upvotes - post.downvotes)}
                    </span>
                    <button
                        onClick={() => handleVote(post.postId, "downvote")}
                        className="text-gray-400 hover:text-[#7193ff] cursor-pointer p-0.5 sm:p-1 rounded transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                        <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </button>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-1.5 md:mb-2 text-[10px] sm:text-xs md:text-sm text-gray-400 flex-wrap">
                        <span className="font-semibold hover:underline cursor-pointer truncate max-w-[100px] sm:max-w-none">
                            r/{post.tags?.[0] || "general"}
                        </span>
                        <span className="hidden xs:inline">•</span>
                        <span onClick={() => router.push(`/profile/${post.userId}`)} className="hover:underline cursor-pointer truncate max-w-20 sm:max-w-none">
                            u/{post.user?.name || "Unknown User"}
                        </span>
                        <span className="hidden xs:inline">•</span>
                        <span className="text-[9px] sm:text-[10px] md:text-xs">
                            {formatTimeAgo(post.createdAt)}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h2 className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight cursor-pointer transition-colors duration-300">
                            {post.title}
                        </h2>

                        {post.media && post.media.length > 0 && (
                            <div className="relative mb-4 px-6 overflow-hidden rounded-xl">
                                <div
                                    className="absolute inset-0 blur-2xl scale-110 opacity-30"
                                    style={{
                                        backgroundImage: `url(${post.media[0]})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        filter: 'blur(20px)',
                                        zIndex: 0,
                                    }}
                                />

                                <a
                                    href={post.media[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative z-5 block"
                                >
                                    <img
                                        src={post.media[0]}
                                        alt={post.title}
                                        width={900}
                                        height={600}
                                        className="max-w-full max-h-128 mx-auto rounded object-contain"
                                        loading="lazy"
                                    />
                                </a>
                            </div>
                        )}

                        <p className="text-gray-400 text-xs sm:text-sm md:text-base wrap-break-word leading-relaxed">
                            {post.content && post.content.length > 150
                                ? `${post.content.substring(0, 250)}...`
                                : post.content}
                        </p>
                    </div>

                    <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-wrap mt-2 sm:mt-3">
                        <button className="flex items-center cursor-pointer gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95">
                            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            <span className="text-[10px] sm:text-xs md:text-sm font-semibold">
                                {post.commentCount || 0}
                            </span>
                        </button>

                        <button className="flex items-center cursor-pointer gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95">
                            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            <span className="text-[10px] sm:text-xs md:text-sm font-semibold hidden md:inline">
                                Share
                            </span>
                        </button>

                        <button className="flex items-center cursor-pointer gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95">
                            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            <span className="text-[10px] sm:text-xs md:text-sm font-semibold hidden md:inline">
                                Save
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-[#0d1d2c] border rounded-lg p-4 ">
                <h3 className="text-lg font-medium mb-3">Comment</h3>
                <InlineReply parentId={null}
                />
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">{comments.length} comments</h3>


                <div className="space-y-3">
                    {sortedTree.map((c) => (
                        <Comment
                            key={c.id}
                            comment={c}
                            onToggleCollapse={handleToggleCollapse}
                        />
                    ))}
                    {sortedTree.length === 0 && <div className="text-gray-500">Be the first to comment.</div>}
                </div>

            </div>
        </div>
    );
}