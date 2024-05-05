import os


class Uploader:
    @staticmethod
    def get_filename(prefix):
        def get_fullpath(instance, filename):
            format = filename.split('.')[-1]
            fullpath = os.path.join(prefix, f'{instance.user.username}.{format}')
            if os.path.exists(f'media/{fullpath}'):
                os.remove(f'media/{fullpath}')
            return fullpath
        return get_fullpath
