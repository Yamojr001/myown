import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ auth, users }) {
    const { post, processing } = useForm();

    const handleToggleAdmin = (user) => {
        if (confirm(`Are you sure you want to ${user.is_admin ? 'demote' : 'promote'} ${user.name}?`)) {
            post(route('admin.users.toggle-admin', user.id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Manage Scholars" />

            <div className="py-12 px-4 sm:px-8 lg:px-12">
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-brand-dark tracking-tight uppercase mb-2">Scholar Management</h2>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Oversee all registered students and administrators</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Scholar</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-brand-dark">{user.name}</div>
                                                    <div className="text-sm text-gray-400 font-medium">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.is_admin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {user.is_admin ? 'Administrator' : 'Scholar'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {user.is_active ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-gray-400 italic">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.name}?`)) {
                                                        post(route('admin.users.toggle-status', user.id));
                                                    }
                                                }}
                                                disabled={processing || user.id === auth.user.id}
                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                                    user.is_active 
                                                    ? 'text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white' 
                                                    : 'text-green-600 bg-green-50 hover:bg-green-600 hover:text-white'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleToggleAdmin(user)}
                                                disabled={processing || user.id === auth.user.id}
                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                                    user.is_admin 
                                                    ? 'text-red-600 bg-red-50 hover:bg-red-600 hover:text-white' 
                                                    : 'text-brand-blue bg-brand-blue/5 hover:bg-brand-blue hover:text-white'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {user.is_admin ? 'Demote' : 'Promote'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Simple Pagination */}
                    {users.links.length > 3 && (
                        <div className="p-8 bg-gray-50/50 flex justify-center gap-2">
                            {users.links.map((link, i) => (
                                <button
                                    key={i}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    onClick={() => link.url && (window.location.href = link.url)}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                        link.active 
                                        ? 'bg-brand-blue text-white' 
                                        : 'bg-white text-gray-400 hover:bg-brand-blue/10'
                                    } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
