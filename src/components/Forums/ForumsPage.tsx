import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, ThumbsUp, MessageSquare, 
  Plus, Search, 
  Flag, MoreVertical, XCircle 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { Forum, ForumPost, Club, User as UserType } from '../../types';

interface ForumsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const ForumsPage: React.FC<ForumsPageProps> = ({ onNavigate: _onNavigate }) => {
  const { currentUser } = useAuth();
  const [forums, setForums] = useState<Forum[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateForum, setShowCreateForum] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState<string>('all');

  const [postForm, setPostForm] = useState({
    content: '',
    forumId: ''
  });
  const replyTo = (forum: Forum, quote?: string) => {
    setSelectedForum(forum);
    setPostForm({ content: quote ? `> ${quote}\n\n` : '', forumId: forum.id });
    setShowCreatePost(true);
  };

  const [forumForm, setForumForm] = useState({
    title: '',
    clubId: '',
    isPrivate: false
  });

  useEffect(() => {
    loadForums();
  }, []);

  useEffect(() => {
    if (selectedForum) {
      loadPosts(selectedForum.id);
    }
  }, [selectedForum]);

  const loadForums = async () => {
    try {
      const allForums = dataService.getForums();
      const allClubs = dataService.getClubs();
      const allUsers = dataService.getUsers();
      
      setForums(allForums);
      setClubs(allClubs);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading forums:', error);
    }
  };

  const loadPosts = async (forumId: string) => {
    try {
      const forumPosts = dataService.getForumPosts(forumId);
      setPosts(forumPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedForum || !postForm.content.trim()) return;

    try {
      const created = dataService.createForumPost({
        forumId: selectedForum.id,
        content: postForm.content,
        postedBy: currentUser?.id || '',
        likes: 0,
        isFlagged: false
      });
      setPostForm({ content: '', forumId: '' });
      setShowCreatePost(false);
      setPosts([created, ...posts]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newForum: Partial<Forum> = {
      clubId: forumForm.clubId,
      title: forumForm.title,
      isPrivate: forumForm.isPrivate,
      createdBy: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      console.log('Creating forum:', newForum);
      setForumForm({ title: '', clubId: '', isPrivate: false });
      setShowCreateForum(false);
      loadForums();
    } catch (error) {
      console.error('Error creating forum:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const getClubById = (clubId: string) => {
    return clubs.find(club => club.id === clubId);
  };

  const canCreateForum = () => {
    return currentUser?.role === 'ADMIN' || currentUser?.role === 'TEACHER';
  };

  const canModerate = (forum: Forum) => {
    if (currentUser?.role === 'ADMIN') return true;
    if (currentUser?.role === 'TEACHER') {
      const club = getClubById(forum.clubId);
      return club?.advisorId === currentUser.id;
    }
    return false;
  };

  const filteredForums = forums.filter(forum => {
    if (selectedClub !== 'all' && forum.clubId !== selectedClub) return false;
    if (searchTerm && !forum.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forums</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join discussions and connect with your school community
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          {canCreateForum() && (
            <button
              onClick={() => setShowCreateForum(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Forum
            </button>
          )}
          {selectedForum && (
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              New Post
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search forums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Clubs</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedClub('all');
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forums List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Discussion Forums</h2>
            </div>
            <div className="p-6">
              {filteredForums.length > 0 ? (
                <div className="space-y-3">
                  {filteredForums.map((forum) => {
                    const club = getClubById(forum.clubId);
                    const isSelected = selectedForum?.id === forum.id;
                    
                    return (
                      <div
                        key={forum.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700'
                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => setSelectedForum(forum)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {forum.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {club?.name}
                            </p>
                            {forum.isPrivate && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mt-1">
                                Private
                              </span>
                            )}
                          </div>
                          {canModerate(forum) && (
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No forums found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="lg:col-span-2">
          {selectedForum ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedForum.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getClubById(selectedForum.clubId)?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    New Post
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post) => {
                      const author = getUserById(post.postedBy);
                      
                      return (
                        <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          <div className="flex items-start space-x-4">
                            <img
                              src={author?.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                              alt={author?.fullName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {author?.fullName}
                                  </h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(post.createdAt)} at {formatTime(post.createdAt)}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button 
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    onClick={() => {
                                      const updated = dataService.updateForumPost(post.id, { likes: post.likes + 1 });
                                      if (updated) setPosts(posts.map(p => p.id === post.id ? updated : p));
                                    }}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </button>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{post.likes}</span>
                                  <button className="text-gray-400 hover:text-gray-600"
                                    onClick={() => replyTo(selectedForum!, post.content)}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </button>
                                  <button className="text-gray-400 hover:text-red-600">
                                    <Flag className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                {post.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No posts yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Be the first to start a discussion in this forum
                    </p>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Create First Post
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Forum
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a forum from the list to view and participate in discussions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && selectedForum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Post
                </h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Forum
                  </label>
                  <input
                    type="text"
                    value={selectedForum.title}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Message
                  </label>
                  <textarea
                    required
                    value={postForm.content}
                    onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                    rows={6}
                    placeholder="Share your thoughts, questions, or ideas..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Post Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Forum Modal */}
      {showCreateForum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Forum
                </h2>
                <button
                  onClick={() => setShowCreateForum(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateForum} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Forum Title
                  </label>
                  <input
                    type="text"
                    required
                    value={forumForm.title}
                    onChange={(e) => setForumForm({...forumForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Club
                  </label>
                  <select
                    required
                    value={forumForm.clubId}
                    onChange={(e) => setForumForm({...forumForm, clubId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a club</option>
                    {clubs.map(club => (
                      <option key={club.id} value={club.id}>{club.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={forumForm.isPrivate}
                    onChange={(e) => setForumForm({...forumForm, isPrivate: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Private forum (members only)
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForum(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Forum
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumsPage;
